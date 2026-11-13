// app/mypage/page.tsx
// 마이페이지: 내 정보, 기부 통계, 포인트 내역을 한 곳에서 보여줘요.
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
	getMyPoints,
	getMyProfile,
	type MyPoints,
	type MyProfile,
	type PointEntry
} from "../donations/data";
import AvatarUploader from "./avatar-uploader";
import WithdrawSection from "./withdraw-section";
import NicknameEditor from "./nickname-editor";
import FlipText from "../donations/flip-text";
import { body, display } from "../donations/fonts";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "마이페이지"
};

/* ---------- 표시용 도우미 함수 ---------- */

const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;

function relativeTime(iso: string) {
	const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
	const abs = Math.abs(diffSec);
	if (abs < 60) return "방금 전";
	const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
	if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
	if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
	return rtf.format(Math.round(diffSec / 86_400), "day");
}

// 서버가 UTC로 준 가입일을 한국 날짜로 보여줘요. (예: 2026년 11월 12일)
function joinedDate(iso: string) {
	return new Date(iso).toLocaleDateString("ko-KR", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}

/* ---------- 페이지 ---------- */

// 페이지 자체는 동기 함수로 두고, 사람마다 다른 값은 <Suspense> 안에서 요청 시점에 그려요.
export default function MyPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<p className={styles.notice} role="note">
				모의 포인트로 운영되는 학습용 서비스예요. 실제 결제와 모금은
				이뤄지지 않아요.
			</p>

			<main className={styles.wrap}>
				<Link href="/donations" className={styles.back}>
					기부 현황으로 돌아가기
				</Link>
				<Suspense fallback={<LoadingState />}>
					<MyPageContent />
				</Suspense>
			</main>
		</div>
	);
}

function LoadingState() {
	return (
		<p className={styles.loading} role="status">
			내 정보를 불러오는 중이에요.
		</p>
	);
}

async function MyPageContent() {
	// "여기부터는 요청이 올 때 그린다"는 표시예요. 현재 시각을 쓰는 코드보다 먼저 있어야 해요.
	await connection();

	const [profile, points] = await Promise.all([
		getMyProfile(),
		getMyPoints()
	]);
	if (!profile || !points) return <SignedOut />;

	return (
		<>
			<h1 className={`${styles.pageTitle} ${display.className}`}>
				마이페이지
			</h1>
			<ProfileCard profile={profile} />
			<Stats profile={profile} />
			<PointSection points={points} balance={profile.point} />
			<WithdrawSection balance={profile.point} />
		</>
	);
}

/* ---------- 조각 컴포넌트 ---------- */

function SignedOut() {
	return (
		<div className={styles.signedOut}>
			<h1 className={`${styles.signedOutTitle} ${display.className}`}>
				로그인하면 마이페이지를 볼 수 있어요
			</h1>
			<p className={styles.muted}>
				내 정보와 포인트 내역은 로그인한 뒤에 확인할 수 있어요.
			</p>
			<Link
				href="/login"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				로그인하기
			</Link>
		</div>
	);
}

function ProfileCard({ profile }: { profile: MyProfile }) {
	return (
		<section className={styles.profile} aria-label="내 정보">
			<AvatarUploader nickname={profile.nickname}>
				{
					profile.userImage ?
						// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={profile.userImage}
							alt={`${profile.nickname} 프로필 이미지`}
							className={styles.avatarImg}
						/>
						// 이미지가 없으면 닉네임의 첫 글자를 보여줘요.
					:	<span
							className={`${styles.avatarFallback} ${display.className}`}
							aria-hidden="true"
						>
							{profile.nickname.slice(0, 1)}
						</span>

				}
			</AvatarUploader>
			<div className={styles.profileInfo}>
				<NicknameEditor
					nickname={profile.nickname}
					displayClassName={display.className}
				/>
				<dl className={styles.facts}>
					<div className={styles.fact}>
						<dt>이메일</dt>
						<dd>{profile.email}</dd>
					</div>
					<div className={styles.fact}>
						<dt>가입일</dt>
						<dd>{joinedDate(profile.createdAt)}</dd>
					</div>
				</dl>
			</div>
			<Link
				href="/donations#targets"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				기부하러 가기
			</Link>
		</section>
	);
}

function Stats({ profile }: { profile: MyProfile }) {
	return (
		<dl className={styles.stats}>
			<Stat
				label="지금 쓸 수 있는 포인트"
				value={profile.point}
				unit="P"
			/>
			<Stat
				label="내가 기부한 횟수"
				value={profile.donationCount}
				unit="번"
			/>
			<Stat
				label="내가 기부한 포인트"
				value={profile.totalDonation}
				unit="P"
			/>
		</dl>
	);
}

function Stat({
	label,
	value,
	unit
}: {
	label: string;
	value: number;
	unit: string;
}) {
	return (
		<div className={styles.stat}>
			<dt className={styles.statLabel}>{label}</dt>
			<dd className={styles.statValue}>
				<span className={`${styles.statNum} ${display.className}`}>
					<FlipText text={value.toLocaleString("ko-KR")} />
				</span>
				<span className={styles.statUnit}>{unit}</span>
			</dd>
		</div>
	);
}

function PointSection({
	points,
	balance
}: {
	points: MyPoints;
	balance: number;
}) {
	return (
		<section
			id="points"
			className={styles.points}
			aria-labelledby="points-title"
		>
			<div className={styles.sectionHead}>
				<h2
					id="points-title"
					className={`${styles.h2} ${display.className}`}
				>
					포인트 내역
				</h2>
				<p className={styles.muted}>
					<FlipText
						text={`지금 ${pt(balance)}을(를) 갖고 있어요. 최근 ${points.recent.length}건만 보여요.`}
					/>
				</p>
			</div>

			{points.recent.length > 0 ?
				<ol className={styles.entryList}>
					{points.recent.map((e) => (
						<EntryRow key={e.pointId} entry={e} />
					))}
				</ol>
			:	<p className={styles.empty}>
					아직 포인트 내역이 없어요. 기부하면 이곳에 기록돼요.{" "}
					<Link href="/donations#targets" className={styles.textLink}>
						기부처 둘러보기
					</Link>
				</p>
			}
		</section>
	);
}

function EntryRow({ entry }: { entry: PointEntry }) {
	const earn = entry.pointType === "적립";
	return (
		<li className={styles.entry}>
			<div>
				<p className={styles.entryDesc}>{entry.description}</p>
				<p className={styles.entryTime}>
					{entry.pointType}{" "}
					<FlipText text={relativeTime(entry.createdAt)} />
				</p>
			</div>
			<p
				className={`${styles.entryAmount} ${earn ? styles.earn : styles.spend}`}
			>
				{earn ? "+" : "−"}
				<FlipText text={pt(Math.abs(entry.pointAmount))} />
			</p>
		</li>
	);
}
