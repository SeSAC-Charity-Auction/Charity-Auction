import { relativeTime, won } from "../../donations/format";
import BidHistoryItem from "../BidHistoryItem";
import styles from "./page.module.css";

export default function BidHistory({
	bids,
	total
}: {
	bids: BidHistoryItem[];
	total: number;
}) {
	return (
		<section aria-labelledby="bids-title" className={styles.history}>
			<div className={styles.historyHead}>
				<h2 id="bids-title" className={styles.h2}>
					입찰 내역
				</h2>
				<p className={styles.muted}>
					{total > bids.length ?
						`전체 ${total.toLocaleString("ko-KR")}건 중 최근 ${bids.length}건`
					:	`${total.toLocaleString("ko-KR")}건`}
				</p>
			</div>

			{bids.length > 0 ?
				<ol className={styles.bidList}>
					{bids.map((b, i) => (
						<li
							key={b.bidId}
							className={`${styles.bidItem} ${i === 0 ? styles.bidTop : ""}`}
						>
							<div>
								<p className={styles.bidder}>
									{b.nickname}
									{i === 0 && (
										<span className={styles.topTag}>최고가</span>
									)}
								</p>
								<p className={styles.bidTime}>{relativeTime(b.bidAt)}</p>
							</div>
							<p className={styles.bidPrice}>{won(b.bidPrice)}</p>
						</li>
					))}
				</ol>
			:	<p className={styles.empty}>
					아직 입찰이 없어요. 첫 입찰의 주인공이 되어 보세요.
				</p>
			}
		</section>
	);
}
