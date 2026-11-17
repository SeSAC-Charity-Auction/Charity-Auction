import Link from "next/link";
import MyAuction from "../auctions/MyAuction";
import statusLabel from "../auctions/statusLabel";
import timeLabel from "../auctions/timeLabel";
import { won } from "../donations/format";
import styles from "./page.module.css";
import pt from "./pt";
import Thumb from "./Thumb";

// 내가 올린 경매 한 줄 (낙찰되었다면 판매자로서 받은 포인트도 함께)
export default function MyAuctionRow({ auction }: { auction: MyAuction }) {
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
				{auction.pointAmount > 0 && (
					<p className={`${styles.rowPoint} ${styles.earn}`}>
						판매 포인트 +{pt(auction.pointAmount)}
					</p>
				)}
			</div>
		</li>
	);
}
