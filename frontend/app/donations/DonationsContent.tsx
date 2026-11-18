import SmoothScrollLink from "./SmoothScrollLink";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import isLoggedIn from "../auth/isLoggedIn";
import Stat from "./[targetId]/Stat";
import DonationRow from "./DonationRow";
import EmptyTicket from "./EmptyTicket";
import FlipText from "./FlipText";
import { display } from "./fonts";
import { won } from "./format";
import { getDonationSummary } from "./getDonationSummary";
import LatestTicket from "./LatestTicket";
import MyWallet from "./MyWallet";
import styles from "./page.module.css";
import TargetCard from "./TargetCard";
import TargetCarousel from "./TargetCarousel";
import WalletSkeleton from "./WalletSkeleton";

export default async function DonationsContent() {
	// "여기부터는 요청이 올 때 그린다"는 표시예요. 현재 시각을 쓰는 코드보다 먼저 있어야 해요.
	await connection();
	const loggedIn = await isLoggedIn();
	const data = await getDonationSummary();
	// 기부할 수 있는 기부처만 보여주고(목표 금액을 채운 곳은 목록에서 빠져요), 모금이 가장 많이 된 곳을 맨 앞에 둡니다.
	const activeTargets = data.targets
		.filter((t) => t.isActive && !t.isAchieved)
		.sort((a, b) => b.totalDonation - a.totalDonation);
	const latest = data.recentDonations[0];
	const heroTitle =
		data.donationCount > 0
			? `기부금 ${won(data.totalDonation)}이 ${data.targets.length}곳의 기부처에 모였어요`
			: "첫 기부가 이곳에 가장 먼저 기록돼요";
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
						기부처마다 목표 금액 대비 얼마나 모였는지 확인하고, 마음이 가는 곳에
						기부해 보세요.
					</p>
					<div className={styles.actions}>
						<SmoothScrollLink
							href="#targets"
							className={`${styles.btn} ${styles.btnPrimary}`}
						>
							기부처 둘러보기
						</SmoothScrollLink>
						{loggedIn && (
							<Link
								href="/mypage"
								className={`${styles.btn} ${styles.btnGhost}`}
							>
								마이페이지
							</Link>
						)}
					</div>
				</div>
				<figure className={styles.heroFigure}>
					<figcaption className={styles.figcaption}>가장 최근 기부</figcaption>
					{latest ? <LatestTicket record={latest} /> : <EmptyTicket />}
				</figure>
			</section>
			{/* 2. 숫자 요약 */}
			<dl className={styles.stats}>
				<Stat label="전체 기부금" value={data.totalDonation} unit="원" />
				<Stat label="기부 횟수" value={data.donationCount} unit="번" />
				<Stat label="기부에 참여한 사람" value={data.donorCount} unit="명" />
				<Stat
					label="기부할 수 있는 기부처"
					value={activeTargets.length}
					unit="곳"
				/>
			</dl>
			{/* 3. 내 포인트 (로그인한 사용자에게만 보여요) */}
			{loggedIn && (
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
			)}
			{/* 4. 기부처 */}
			<section
				id="targets"
				tabIndex={-1}
				aria-labelledby="targets-title"
				className={styles.targets}
			>
				<div className={styles.sectionHead}>
					<h2
						id="targets-title"
						className={`${styles.h2} ${display.className}`}
					>
						기부할 수 있는 기부처
					</h2>
				</div>
				{activeTargets.length > 0 ? (
					<TargetCarousel
						items={activeTargets.map((t) => ({
							key: String(t.targetId),
							node: <TargetCard target={t} />
						}))}
					/>
				) : (
					<p className={styles.empty}>
						지금 기부할 수 있는 기부처가 없어요. 새 기부처가 등록되면 이곳에
						표시돼요.
					</p>
				)}
			</section>
			{/* 5. 최근 기부 */}
			<section aria-labelledby="recent-title">
				<div className={styles.sectionHead}>
					<h2 id="recent-title" className={`${styles.h2} ${display.className}`}>
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
				{data.recentDonations.length > 0 ? (
					<ol className={styles.donationList}>
						{data.recentDonations.map((record) => (
							<DonationRow key={record.donationId} record={record} />
						))}
					</ol>
				) : (
					<p className={styles.empty}>
						아직 기부 기록이 없어요.{" "}
						<SmoothScrollLink href="#targets" className={styles.textLink}>
							첫 기부에 참여해 보세요
						</SmoothScrollLink>
					</p>
				)}
			</section>
		</>
	);
}
