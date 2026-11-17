import Link from "next/link";
import { won } from "../donations/format";
import AuctionSummary from "./AuctionSummary";
import styles from "./page.module.css";
import timeLabel from "./timeLabel";

export default function AuctionCard({ auction }: { auction: AuctionSummary }) {
	const time = timeLabel(auction);
	const scheduled = auction.status === "SCHEDULED";
	return (
		<article className={styles.card}>
			<div className={styles.thumb}>
				{auction.image ?
					// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={auction.image}
						alt={`${auction.title} 이미지`}
						loading="lazy"
						className={styles.thumbImg}
					/>
				:	<span className={styles.thumbFallback} aria-hidden="true">
						{auction.title.slice(0, 1)}
					</span>
				}
				<span
					className={`${styles.badge} ${scheduled ? styles.badgeSoon : styles.badgeLive}`}
				>
					{scheduled ? "예정" : "진행 중"}
				</span>
			</div>
			<div className={styles.cardBody}>
				<p className={styles.category}>{auction.categoryName}</p>
				<h3 className={styles.cardTitle}>
					<Link
						href={`/auctions/${auction.auctionId}`}
						className={styles.cardLink}
					>
						{auction.title}
					</Link>
				</h3>
				<div className={styles.priceRow}>
					<span className={styles.priceLabel}>
						{auction.bidCount > 0 ? "현재 입찰가" : "시작 가격"}
					</span>
					<span className={styles.price}>
						{won(auction.currentPrice)}
					</span>
				</div>
				<p className={styles.meta}>
					<span>
						입찰 {auction.bidCount.toLocaleString("ko-KR")}회
					</span>
					<span className={time.urgent ? styles.urgent : undefined}>
						{time.text}
					</span>
				</p>
			</div>
		</article>
	);
}
