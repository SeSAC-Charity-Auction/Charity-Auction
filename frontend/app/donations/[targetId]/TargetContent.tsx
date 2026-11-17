import { notFound } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";
import DonationRow from "../donation-row";
import FlipText from "../FlipText";
import { display } from "../fonts";
import { won } from "../format";
import getMyProfile from "../getMyProfile";
import DonatePanel from "./DonatePanel";
import styles from "./page.module.css";
import PanelSkeleton from "./PanelSkeleton";
import Stat from "./Stat";
import TargetImageUploader from "./TargetImageUploader";
import getDonationTarget from "../getDonationTarget";

export default async function TargetContent({
	params
}: {
	params: Promise<{ targetId: string }>;
}) {
	const { targetId: rawId } = await params;
	await connection();
	const targetId = Number(rawId);
	if (!Number.isInteger(targetId) || targetId <= 0) notFound();
	// 이미지를 바꿀 수 있는 사람(ADMIN 또는 개발 환경)인지도 함께 확인해요.
	const [detail, profile] = await Promise.all([
		getDonationTarget(targetId),
		getMyProfile()
	]);
	if (!detail) notFound();
	const canEditImage = profile?.canEditTargets ?? false;
	const { target, donorCount, donationCount, recentDonations } = detail;
	const pct =
		target.targetAmount > 0 ?
			Math.floor((target.totalDonation / target.targetAmount) * 100)
		:	0;
	const barWidth = Math.min(100, pct);
	const remaining = Math.max(0, target.targetAmount - target.totalDonation);
	const heroImage = (
		<>
			{target.targetImage ?
				// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
				// eslint-disable-next-line @next/next/no-img-element
				<img
					src={target.targetImage}
					alt={`${target.targetName} 대표 이미지`}
					className={styles.heroImg}
				/>
			:	<span
					className={`${styles.heroFallback} ${display.className}`}
					aria-hidden="true"
				>
					{target.targetName.slice(0, 1)}
				</span>
			}
		</>
	);
	return (
		<div className={styles.layout}>
			{/* 1. 기부처 소개와 진행 상황 */}
			<section className={styles.head} aria-labelledby="target-title">
				{canEditImage ?
					<TargetImageUploader
						targetId={target.targetId}
						targetName={target.targetName}
					>
						{heroImage}
					</TargetImageUploader>
				:	<div className={styles.heroThumb}>{heroImage}</div>}
				<div className={styles.titleRow}>
					<h1
						id="target-title"
						className={`${styles.title} ${display.className}`}
					>
						{target.targetName}
					</h1>
					<span
						className={`${styles.badge} ${target.isActive && !target.isAchieved ? styles.badgeOpen : styles.badgeClosed}`}
					>
						{target.isAchieved ?
							"목표 달성"
						: target.isActive ?
							"기부 가능"
						:	"기부 마감"}
					</span>
				</div>
				{target.description && (
					<p className={styles.lead}>{target.description}</p>
				)}
				<div className={styles.progressBlock}>
					<div className={styles.progressTop}>
						<span className={`${styles.pct} ${display.className}`}>
							<FlipText text={`${pct}%`} />
						</span>
						<span className={styles.progressNote}>
							{remaining > 0 ?
								<FlipText
									text={`목표까지 ${won(remaining)} 남았어요`}
								/>
							:	"목표 금액을 모두 채웠어요"}
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
						{[25, 50, 75].map((p) => (
							<span
								key={p}
								className={styles.tick}
								style={{ left: `${p}%` }}
								aria-hidden="true"
							/>
						))}
					</div>
					<div className={styles.amounts}>
						<span className={styles.raised}>
							<FlipText
								text={`${won(target.totalDonation)} 모였어요`}
							/>
						</span>
						<span className={styles.goal}>
							목표 <FlipText text={won(target.targetAmount)} />
						</span>
					</div>
				</div>
				<dl className={styles.stats}>
					<Stat
						label="누적 기부금"
						value={target.totalDonation}
						unit="원"
					/>
					<Stat
						label="기부에 참여한 사람"
						value={donorCount}
						unit="명"
					/>
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
					<h2
						id="recent-title"
						className={`${styles.h2} ${display.className}`}
					>
						최근 기부
					</h2>
					<p className={styles.sectionNote}>
						기부한 사람의 이름은 일부만 보여요.
					</p>
				</div>
				{recentDonations.length > 0 ?
					<ol className={styles.donationList}>
						{recentDonations.map((record) => (
							<DonationRow
								key={record.donationId}
								record={record}
							/>
						))}
					</ol>
				:	<p className={styles.empty}>
						아직 이 기부처에 기부한 사람이 없어요. 첫 기부를 남겨
						보세요.
					</p>
				}
			</section>
		</div>
	);
}
