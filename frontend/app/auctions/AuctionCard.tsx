import Link from "next/link";
import { won } from "../donations/format";
import FlipText from "../donations/FlipText";
import AuctionSummary from "./AuctionSummary";
import isClosedAuction from "./isClosedAuction";
import styles from "./page.module.css";
import timeLabel from "./timeLabel";

export default function AuctionCard({ auction }: { auction: AuctionSummary }) {
	const time = timeLabel(auction);
	const scheduled = auction.status === "SCHEDULED";
	const closed = isClosedAuction(auction);
	const inProgress = auction.status === "IN_PROGRESS";
	return (
		<article className={`${styles.card} ${closed ? styles.cardClosed : ""}
		${inProgress ? styles.cardLive : ""} `}>
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
					className={`${styles.badge} ${closed ? styles.badgeClosed : scheduled ? styles.badgeSoon : styles.badgeLive}`}
				>
					{closed ? "마감" : scheduled ? "예정" : "진행 중"}
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
						{auction.bidCount > 0 ?
							closed ? "최종 입찰가" : "현재 입찰가"
						:	"시작 가격"}
					</span>
					<span className={styles.price}>
						<FlipText text={won(auction.currentPrice)} />
					</span>
				</div>
				<p className={styles.meta}>
					<span>
						입찰{" "}
						<FlipText
							text={`${auction.bidCount.toLocaleString("ko-KR")}회`}
						/>
					</span>
					<span className={time.urgent ? styles.urgent : undefined}>
						<FlipText text={time.text} />
					</span>
				</p>
			</div>
		</article>
	);
}
