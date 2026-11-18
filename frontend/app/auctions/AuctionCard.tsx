"use client";

import Link from "next/link";
import FlipText from "../donations/FlipText";
import AuctionSummary from "./AuctionSummary";
import isClosedAuction from "./isClosedAuction";
import {
	LiveCardBidCount,
	LiveCardPrice,
	LiveCardPriceLabel
} from "./LiveAuctionPrices";
import styles from "./page.module.css";
import timeLabel from "./timeLabel";
import useNow from "./useNow";

// now는 서버가 목록을 그린 시각이에요. 그 뒤로는 1초마다 남은 시간과 마감 여부를 다시 계산해요.
export default function AuctionCard({
	auction,
	now: serverNow
}: {
	auction: AuctionSummary;
	now: number;
}) {
	const now = useNow(serverNow);
	const time = timeLabel(auction, now);
	const scheduled = auction.status === "SCHEDULED";
	const scheduled = auction.status === "SCHEDULED";
	const closed = isClosedAuction(auction, now);
	const inProgress = auction.status === "IN_PROGRESS" && !closed;
  
	// 실시간 값과 비교할 서버 값이에요.
	const live = {
		auctionId: auction.auctionId,
		currentPrice: auction.currentPrice,
		bidCount: auction.bidCount
	};
  
	return (
		<article className={`${styles.card} ${closed ? styles.cardClosed : ""}
		${inProgress ? styles.cardLive : ""} `}>
			<div className={styles.thumb}>
				{auction.image ?
					// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
					// eslint-disable-next-line @next/next/no-img-element
					<img
						src={auction.image}
						alt=""
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
						<LiveCardPriceLabel {...live} closed={closed} />
					</span>
					<span className={styles.price}>
						<LiveCardPrice {...live} />
					</span>
				</div>
				<p className={styles.meta}>
					<span>
						입찰{" "}
						<LiveCardBidCount {...live} />
					</span>
					<span className={time.urgent ? styles.urgent : undefined}>
						<FlipText text={time.text} />
					</span>
				</p>
			</div>
		</article>
	);
}
