import InView from "./InView";
import Link from "next/link";
import DonationTarget from "./DonationTarget";
import FlipText from "./FlipText";
import { display } from "./fonts";
import { won } from "./format";
import styles from "./page.module.css";
import progressOf from "./progressOf";
import summaryOf from "./summaryOf";

export default function TargetCard({ target }: { target: DonationTarget }) {
	const { pct, barWidth } = progressOf(target);
	return (
		<article className={styles.card}>
			<div className={styles.thumb}>
				{
					target.targetImage ?
						// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={target.targetImage}
							alt=""
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
				<p className={styles.cardSummary}>
					{summaryOf(target.description)}
				</p>
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
				<InView
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
				</InView>
				<p className={styles.raised}>
					<FlipText text={`${won(target.totalDonation)} 모였어요`} />
				</p>
			</div>
		</article>
	);
}
