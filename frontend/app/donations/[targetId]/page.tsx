// app/donations/[targetId]/page.tsx
import { Suspense } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { getDonationTarget, getMyPoints, type DonationRecord, type DonationTarget } from "../data";
import { body, display } from "../fonts";
import DonateForm from "./donate-form";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "기부처 상세",
};

/* ---------- 표시용 도우미 함수 ---------- */

const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

function relativeTime(iso: string) {
  const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
  const abs = Math.abs(diffSec);
  if (abs < 60) return "방금 전";
  const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
  return rtf.format(Math.round(diffSec / 86_400), "day");
}

/* ---------- 페이지 ---------- */

// 주소의 [targetId] 값(params)도 요청이 와야 알 수 있는 값이라, <Suspense> 안에서 읽어요.
export default function TargetPage({ params }: { params: Promise<{ targetId: string }> }) {
  return (
    <div className={`${styles.page} ${body.className}`}>
      <p className={styles.notice} role="note">
        모의 포인트로 운영되는 학습용 서비스예요. 실제 결제와 모금은 이뤄지지 않아요.
      </p>

      <main className={styles.wrap}>
        <Link href="/donations" className={styles.back}>
          기부 현황으로 돌아가기
        </Link>
        <Suspense fallback={<LoadingState />}>
          <TargetContent params={params} />
        </Suspense>
      </main>
    </div>
  );
}

function LoadingState() {
  return (
    <p className={styles.loading} role="status">
      기부처를 불러오는 중이에요.
    </p>
  );
}

async function TargetContent({ params }: { params: Promise<{ targetId: string }> }) {
  const { targetId: rawId } = await params;
  await connection();

  const targetId = Number(rawId);
  if (!Number.isInteger(targetId) || targetId <= 0) notFound();

  const detail = await getDonationTarget(targetId);
  if (!detail) notFound();

  const { target, donorCount, donationCount, recentDonations } = detail;
  const pct =
    target.targetAmount > 0 ? Math.floor((target.totalDonation / target.targetAmount) * 100) : 0;
  const barWidth = Math.min(100, pct);
  const remaining = Math.max(0, target.targetAmount - target.totalDonation);

  return (
    <div className={styles.layout}>
      {/* 1. 기부처 소개와 진행 상황 */}
      <section className={styles.head} aria-labelledby="target-title">
        <div className={styles.heroThumb}>
          {target.targetImage ? (
            // 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={target.targetImage}
              alt={`${target.targetName} 대표 이미지`}
              className={styles.heroImg}
            />
          ) : (
            <span className={`${styles.heroFallback} ${display.className}`} aria-hidden="true">
              {target.targetName.slice(0, 1)}
            </span>
          )}
        </div>

        <div className={styles.titleRow}>
          <h1 id="target-title" className={`${styles.title} ${display.className}`}>
            {target.targetName}
          </h1>
          <span
            className={`${styles.badge} ${target.isActive ? styles.badgeOpen : styles.badgeClosed}`}
          >
            {target.isActive ? "기부 가능" : "기부 마감"}
          </span>
        </div>

        {target.description && <p className={styles.lead}>{target.description}</p>}

        <div className={styles.progressBlock}>
          <div className={styles.progressTop}>
            <span className={`${styles.pct} ${display.className}`}>{pct}%</span>
            <span className={styles.progressNote}>
              {remaining > 0 ? `목표까지 ${won(remaining)} 남았어요` : "목표 금액을 모두 채웠어요"}
            </span>
          </div>
          <div
            className={styles.bar}
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={barWidth}
            aria-label={`${target.targetName} 모금 진행률`}
          >
            <div className={styles.barFill} style={{ width: `${barWidth}%` }} />
            {[25, 50, 75].map((p) => (
              <span key={p} className={styles.tick} style={{ left: `${p}%` }} aria-hidden="true" />
            ))}
          </div>
          <div className={styles.amounts}>
            <span className={styles.raised}>{won(target.totalDonation)} 모였어요</span>
            <span className={styles.goal}>목표 {won(target.targetAmount)}</span>
          </div>
        </div>

        <dl className={styles.stats}>
          <Stat label="누적 기부금" value={target.totalDonation} unit="원" />
          <Stat label="기부에 참여한 사람" value={donorCount} unit="명" />
          <Stat label="기부 횟수" value={donationCount} unit="번" />
        </dl>
      </section>

      {/* 2. 기부 폼 (로그인하지 않았거나 마감됐으면 안내만 보여요) */}
      <section className={styles.formArea} aria-label="기부하기">
        <Suspense fallback={<PanelSkeleton />}>
          <DonatePanel target={target} />
        </Suspense>
      </section>

      {/* 3. 이 기부처의 최근 기부 */}
      <section className={styles.recent} aria-labelledby="recent-title">
        <div className={styles.sectionHead}>
          <h2 id="recent-title" className={`${styles.h2} ${display.className}`}>
            최근 기부
          </h2>
          <p className={styles.sectionNote}>기부한 사람의 이름은 일부만 보여요.</p>
        </div>

        {recentDonations.length > 0 ? (
          <ol className={styles.donationList}>
            {recentDonations.map((record) => (
              <DonationRow key={record.donationId} record={record} />
            ))}
          </ol>
        ) : (
          <p className={styles.empty}>
            아직 이 기부처에 기부한 사람이 없어요. 첫 기부를 남겨 보세요.
          </p>
        )}
      </section>
    </div>
  );
}

/* ---------- 기부 폼 영역 ---------- */

// 내 포인트는 사람마다 다른 값이라 따로 <Suspense>로 감싸요. 늦어져도 소개 부분은 먼저 보여요.
async function DonatePanel({ target }: { target: DonationTarget }) {
  if (!target.isActive) {
    return (
      <div className={styles.panelQuiet}>
        <h2 className={`${styles.panelQuietTitle} ${display.className}`}>기부가 마감됐어요</h2>
        <p className={styles.panelQuietText}>
          이 기부처는 더 이상 기부를 받지 않아요. 다른 기부처를 둘러보세요.
        </p>
        <Link href="/donations#targets" className={styles.textLink}>
          다른 기부처 보기
        </Link>
      </div>
    );
  }

  await connection();
  const points = await getMyPoints();

  if (!points) {
    return (
      <div className={styles.panelQuiet}>
        <h2 className={`${styles.panelQuietTitle} ${display.className}`}>
          로그인하면 기부할 수 있어요
        </h2>
        <p className={styles.panelQuietText}>
          기부는 내 포인트로 해요. 로그인하고 이어서 해 보세요.
        </p>
        <Link href="/login" className={`${styles.btn} ${styles.btnPrimary}`}>
          로그인하기
        </Link>
      </div>
    );
  }

  return (
    <DonateForm
      targetId={target.targetId}
      targetName={target.targetName}
      balance={points.balance}
      currentTotal={target.totalDonation}
      targetAmount={target.targetAmount}
    />
  );
}

function PanelSkeleton() {
  return (
    <div className={styles.panelSkeleton} role="status">
      <span className={styles.srOnly}>기부 폼을 불러오는 중이에요.</span>
    </div>
  );
}

/* ---------- 조각 컴포넌트 ---------- */

function Stat({ label, value, unit }: { label: string; value: number; unit: string }) {
  return (
    <div className={styles.stat}>
      <dt className={styles.statLabel}>{label}</dt>
      <dd className={styles.statValue}>
        <span className={`${styles.statNum} ${display.className}`}>
          {value.toLocaleString("ko-KR")}
        </span>
        <span className={styles.statUnit}>{unit}</span>
      </dd>
    </div>
  );
}

function DonationRow({ record }: { record: DonationRecord }) {
  return (
    <li className={styles.donation}>
      <div>
        <p className={styles.donationName}>{record.donorName}님이 기부했어요</p>
        <p className={styles.donationTime}>{relativeTime(record.createdAt)}</p>
      </div>
      <p className={styles.donationAmount}>{won(record.donationAmount)}</p>
    </li>
  );
}
