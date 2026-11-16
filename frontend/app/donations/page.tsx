// app/donations/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import {
	getDonationSummary,
	getMyPoints,
	type DonationRecord,
	type DonationTarget,
	type MyPoints,
	type PointEntry
} from "./data";
import DonationRow from "./donation-row";
import FlipText from "./flip-text";
import { body, display } from "./fonts";
import { relativeTime, won } from "./format";
import styles from "./page.module.css";
import TargetCarousel from "./target-carousel";

export const metadata: Metadata = {
	title: "기부 현황"
};

/* ---------- 표시용 도우미 함수 ---------- */

const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;

function progressOf(target: DonationTarget) {
	const pct =
		target.targetAmount > 0 ?
			Math.floor((target.totalDonation / target.targetAmount) * 100)
		:	0;
	return { pct, barWidth: Math.min(100, pct) };
}

/* ---------- 페이지 ---------- */

// 페이지 자체는 동기 함수로 두고, 데이터가 필요한 부분만 <Suspense> 안에서 요청 시점에 그립니다.
// (현재 시각이나 API 응답은 "요청할 때마다 달라지는 값"이라 미리 만들어 둘 수 없어요.)
export default function DonationsPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<DonationsContent />
				</Suspense>
			</main>
		</div>
	);
}

function LoadingState() {
	return (
		<p className={styles.loading} role="status">
			기부 현황을 불러오는 중이에요.
		</p>
	);
}

async function DonationsContent() {
	// "여기부터는 요청이 올 때 그린다"는 표시예요. 현재 시각을 쓰는 코드보다 먼저 있어야 해요.
	await connection();

	const data = await getDonationSummary();

	// 기부할 수 있는 기부처만 보여주고(목표 금액을 채운 곳은 목록에서 빠져요), 모금이 가장 많이 된 곳을 맨 앞에 둡니다.
	const activeTargets = data.targets
		.filter((t) => t.isActive && !t.isAchieved)
		.sort((a, b) => b.totalDonation - a.totalDonation);
	const latest = data.recentDonations[0];

	const heroTitle =
		data.donationCount > 0 ?
			`기부금 ${won(data.totalDonation)}이 ${data.targets.length}곳의 기부처에 모였어요`
		:	"첫 기부가 이곳에 가장 먼저 기록돼요";

	return (
		<>
			{/* 1. 첫 화면: 한 문장 요약 + 가장 최근 기부 티켓 */}
			<section className={styles.hero} aria-labelledby="hero-title">
				<div>
					<h1
						id="hero-title"
						className={`${styles.heroTitle} ${display.className}`}
					>
						<FlipText text={heroTitle} />
					</h1>
					<p className={styles.heroText}>
						기부처마다 목표 금액 대비 얼마나 모였는지 확인하고,
						마음이 가는 곳에 기부해 보세요.
					</p>
					<div className={styles.actions}>
						<a
							href="#targets"
							className={`${styles.btn} ${styles.btnPrimary}`}
						>
							기부처 둘러보기
						</a>
						<Link
							href="/mypage"
							className={`${styles.btn} ${styles.btnGhost}`}
						>
							마이페이지
						</Link>
					</div>
				</div>

				<figure className={styles.heroFigure}>
					<figcaption className={styles.figcaption}>
						가장 최근 기부
					</figcaption>
					{latest ?
						<LatestTicket record={latest} />
					:	<EmptyTicket />}
				</figure>
			</section>

			{/* 2. 숫자 요약 */}
			<dl className={styles.stats}>
				<Stat
					label="전체 기부금"
					value={data.totalDonation}
					unit="원"
				/>
				<Stat label="기부 횟수" value={data.donationCount} unit="번" />
				<Stat
					label="기부에 참여한 사람"
					value={data.donorCount}
					unit="명"
				/>
				<Stat
					label="기부할 수 있는 기부처"
					value={activeTargets.length}
					unit="곳"
				/>
			</dl>

			{/* 3. 내 포인트 (로그인한 사용자에게만 값이 보여요) */}
			<section aria-labelledby="wallet-title">
				<div className={styles.sectionHead}>
					<h2
						id="wallet-title"
						className={`${styles.h2} ${display.className}`}
					>
						내 포인트
					</h2>
					<p className={styles.sectionNote}>기부는 포인트로 해요.</p>
				</div>
				<Suspense fallback={<WalletSkeleton />}>
					<MyWallet />
				</Suspense>
			</section>

			{/* 4. 기부처 */}
			<section id="targets" aria-labelledby="targets-title">
				<div className={styles.sectionHead}>
					<h2
						id="targets-title"
						className={`${styles.h2} ${display.className}`}
					>
						기부할 수 있는 기부처
					</h2>
				</div>

				{activeTargets.length > 0 ?
					<TargetCarousel
							items={activeTargets.map((t) => ({
								key: String(t.targetId),
								node: <TargetCard target={t} />
							}))}
						/>
				:	<p className={styles.empty}>
						지금 기부할 수 있는 기부처가 없어요. 새 기부처가
						등록되면 이곳에 표시돼요.
					</p>
				}
			</section>

			{/* 5. 최근 기부 */}
			<section aria-labelledby="recent-title">
				<div className={styles.sectionHead}>
					<h2
						id="recent-title"
						className={`${styles.h2} ${display.className}`}
					>
						최근 기부
					</h2>
					<div className={styles.sectionSide}>
						<p className={styles.sectionNote}>
							기부한 사람의 이름은 일부만 보여요.
						</p>
						<Link
							href="/donations/all"
							className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
						>
							전체 조회
						</Link>
					</div>
				</div>

				{data.recentDonations.length > 0 ?
					<ol className={styles.donationList}>
						{data.recentDonations.map((record) => (
							<DonationRow
								key={record.donationId}
								record={record}
							/>
						))}
					</ol>
				:	<p className={styles.empty}>
						아직 기부 기록이 없어요.{" "}
						<a href="#targets" className={styles.textLink}>
							첫 기부에 참여해 보세요
						</a>
					</p>
				}
			</section>
		</>
	);
}

/* ---------- 조각 컴포넌트 ---------- */

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

function LatestTicket({ record }: { record: DonationRecord }) {
	return (
		<div className={styles.ticket}>
			<div className={styles.ticketBody}>
				<span
					className={`${styles.stamp} ${display.className}`}
					aria-hidden="true"
				>
					기부
				</span>
				<p className={`${styles.ticketName} ${display.className}`}>
					<Link
						href={`/donations/${record.targetId}`}
						className={styles.plainLink}
					>
						{record.targetName}
					</Link>
				</p>
				<p className={styles.ticketMeta}>
					<span>{record.donorName}님</span>
					<span>
						<FlipText text={relativeTime(record.createdAt)} />
					</span>
				</p>
			</div>
			<div className={styles.ticketStub}>
				<p className={styles.ticketPriceLabel}>기부금</p>
				<p className={`${styles.ticketPrice} ${display.className}`}>
					<FlipText text={won(record.donationAmount)} />
				</p>
			</div>
		</div>
	);
}

function EmptyTicket() {
	return (
		<div className={styles.ticket}>
			<div className={styles.ticketBody}>
				<p className={`${styles.ticketName} ${display.className}`}>
					아직 기부 기록이 없어요
				</p>
				<p className={styles.ticketHint}>
					첫 기부가 생기면 이곳에 가장 먼저 보여요.
				</p>
			</div>
			<div className={styles.ticketStub}>
				<p className={styles.ticketPriceLabel}>기부금</p>
				<p className={`${styles.ticketPrice} ${display.className}`}>
					0원
				</p>
			</div>
		</div>
	);
}

function TargetCard({
	target
}: {
	target: DonationTarget;
}) {
	const { pct, barWidth } = progressOf(target);

	return (
		<article
			className={styles.card}
		>
			<div className={styles.thumb}>
				{
					target.targetImage ?
						// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={target.targetImage}
							alt={`${target.targetName} 대표 이미지`}
							loading="lazy"
							className={styles.thumbImg}
						/>
						// 이미지가 없으면 기부처 이름의 첫 글자를 보여줘요.
					:	<span
							className={`${styles.thumbFallback} ${display.className}`}
							aria-hidden="true"
						>
							{target.targetName.slice(0, 1)}
						</span>

				}
			</div>

			<h3 className={`${styles.cardTitle} ${display.className}`}>
				<Link
					href={`/donations/${target.targetId}`}
					className={styles.cardLink}
				>
					{target.targetName}
				</Link>
			</h3>

			{target.description && (
				<p className={styles.cardSummary}>{target.description}</p>
			)}

			<div className={styles.progress}>
				<div className={styles.progressTop}>
					<span className={`${styles.pct} ${display.className}`}>
						<FlipText text={`${pct}%`} />
					</span>
					<span className={styles.goal}>
						목표 <FlipText text={won(target.targetAmount)} />
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
					<div
						className={styles.barFill}
						style={{ width: `${barWidth}%` }}
					/>
				</div>
				<p className={styles.raised}>
					<FlipText text={`${won(target.totalDonation)} 모였어요`} />
				</p>
			</div>
		</article>
	);
}

/* ---------- 내 포인트 ---------- */

// 사람마다 다른 값이라 기부 현황과 따로 <Suspense>로 감싸서, 포인트가 늦어도 나머지는 먼저 보여요.
async function MyWallet() {
	await connection();
	const points = await getMyPoints();
	if (!points) return <WalletSignedOut />;
	return <WalletCard points={points} />;
}

function WalletSkeleton() {
	return (
		<div className={styles.walletSkeleton} role="status">
			<span className={styles.srOnly}>
				내 포인트를 불러오는 중이에요.
			</span>
		</div>
	);
}

function WalletSignedOut() {
	return (
		<div className={styles.walletOut}>
			<div>
				<p className={`${styles.walletOutTitle} ${display.className}`}>
					로그인하면 내 포인트를 볼 수 있어요
				</p>
				<p className={styles.walletLabel}>
					포인트가 있어야 기부할 수 있어요.
				</p>
			</div>
			<Link
				href="/login"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				로그인하기
			</Link>
		</div>
	);
}

// 적립은 더하고 사용은 뺍니다. (사용 금액이 음수로 와도 크기만 씁니다)
const signedAmount = (e: PointEntry) =>
	(e.pointType === "적립" ? 1 : -1) * Math.abs(e.pointAmount);

// 지금 잔액에서 거꾸로 되짚어서, 내역이 생길 때마다의 잔액을 오래된 순서로 만들어요.
function balanceSeries(points: MyPoints) {
	const oldestFirst = [...points.recent].reverse();
	const total = oldestFirst.reduce((sum, e) => sum + signedAmount(e), 0);
	let running = points.balance - total; // 가장 오래된 내역 직전의 잔액
	const series = [running];
	for (const e of oldestFirst) {
		running += signedAmount(e);
		series.push(running);
	}
	return series;
}

function Sparkline({ values, label }: { values: number[]; label: string }) {
	const W = 240;
	const H = 72;
	const PAD = 8;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min;

	const points = values.map((v, i) => {
		const x = PAD + (i * (W - PAD * 2)) / Math.max(1, values.length - 1);
		const y =
			span === 0 ? H / 2 : H - PAD - ((v - min) / span) * (H - PAD * 2);
		return [x, y] as const;
	});
	const path = points
		.map(
			([x, y], i) =>
				`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
		)
		.join(" ");
	const [lastX, lastY] = points[points.length - 1];

	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			role="img"
			aria-label={label}
			className={styles.spark}
		>
			<path d={path} className={styles.sparkLine} />
			<circle cx={lastX} cy={lastY} r={5} className={styles.sparkDot} />
		</svg>
	);
}

function WalletCard({ points }: { points: MyPoints }) {
	const hasHistory = points.recent.length > 0;
	const entries = points.recent.slice(0, 3);

	return (
		<div className={styles.wallet}>
			<div className={styles.walletMain}>
				<div className={styles.walletBalanceRow}>
					<span
						className={`${styles.coin} ${display.className}`}
						aria-hidden="true"
					>
						P
					</span>
					<div>
						<p className={styles.walletLabel}>
							지금 쓸 수 있는 포인트
						</p>
						<p
							className={`${styles.walletBalance} ${display.className}`}
						>
							<FlipText
								text={points.balance.toLocaleString("ko-KR")}
							/>
							<span className={styles.walletUnit}>P</span>
						</p>
					</div>
				</div>
				<div className={styles.walletActions}>
					<a
						href="#targets"
						className={`${styles.btn} ${styles.btnPrimary}`}
					>
						기부하러 가기
					</a>
					<Link href="/mypage#points" className={styles.textLink}>
						포인트 내역 전체 보기
					</Link>
				</div>
			</div>

			<div className={styles.walletSide}>
				{hasHistory ?
					<>
						<Sparkline
							values={balanceSeries(points)}
							label={`최근 포인트 변화예요. 지금은 ${pt(points.balance)}을(를) 갖고 있어요.`}
						/>
						<p className={styles.sparkCaption}>
							<FlipText
								text={`최근 ${points.recent.length}번의 포인트 변화`}
							/>
						</p>
						<ul className={styles.entryList}>
							{entries.map((e) => (
								<li key={e.pointId} className={styles.entry}>
									<div>
										<p className={styles.entryDesc}>
											{e.description}
										</p>
										<p className={styles.entryTime}>
											{e.pointType}{" "}
											<FlipText
												text={relativeTime(e.createdAt)}
											/>
										</p>
									</div>
									<p
										className={`${styles.entryAmount} ${e.pointType === "적립" ? styles.earn : styles.spend}`}
									>
										{e.pointType === "적립" ?
											"+"
										:	"\u2212"}
										<FlipText
											text={pt(Math.abs(e.pointAmount))}
										/>
									</p>
								</li>
							))}
						</ul>
					</>
				:	<p className={styles.walletEmpty}>
						아직 포인트 내역이 없어요. 포인트가 생기면 이곳에
						기록돼요.
					</p>
				}
			</div>
		</div>
	);
}
