import Link from "next/link";
import AuctionSummary from "../auctions/AuctionSummary";
import statusLabel from "../auctions/statusLabel";
import timeLabel from "../auctions/timeLabel";
import { won } from "../donations/format";
import styles from "./page.module.css";
import Thumb from "./Thumb";

// 내가 올린 경매 한 줄
export default function MyAuctionRow({ auction }: { auction: AuctionSummary }) {
	const status = statusLabel(auction);
	const ended = status.tone === "closed";
	return (
		<li className={styles.row}>
			<Thumb image={auction.image} title={auction.title} />
			<div className={styles.rowBody}>
				<p className={styles.rowTitle}>
					<Link href={`/auctions/${auction.auctionId}`} className={styles.rowLink}>
						{auction.title}
					</Link>
				</p>
				<p className={styles.rowMeta}>
					<span>{auction.categoryName}</span>
					<span>입찰 {auction.bidCount.toLocaleString("ko-KR")}회</span>
					{!ended && <span>{timeLabel(auction).text}</span>}
				</p>
			</div>
			<div className={styles.rowSide}>
				<span
					className={`${styles.tag} ${status.tone === "live" ? styles.tagLive : status.tone === "soon" ? styles.tagSoon : styles.tagClosed}`}
				>
					{status.text}
				</span>
				<p className={styles.rowPrice}>{won(auction.currentPrice)}</p>
			</div>
		</li>
	);
}
