import Link from "next/link";
import MyWin from "../auctions/MyWin";
import formatDateTime from "../auctions/formatDateTime";
import { won } from "../donations/format";
import styles from "./page.module.css";
import pt from "./pt";
import Thumb from "./Thumb";

// 낙찰 이력 한 줄: 낙찰가와, 그 낙찰로 받은 포인트
export default function MyWinRow({ win }: { win: MyWin }) {
	return (
		<li className={styles.row}>
			<Thumb image={win.image} title={win.title} />
			<div className={styles.rowBody}>
				<p className={styles.rowTitle}>
					<Link href={`/auctions/${win.auctionId}`} className={styles.rowLink}>
						{win.title}
					</Link>
				</p>
				<p className={styles.rowMeta}>
					<span>낙찰가 {won(win.bidPrice)}</span>
					{win.wonAt && <span>{formatDateTime(win.wonAt)}</span>}
				</p>
			</div>
			<div className={styles.rowSide}>
				<span className={styles.rowLabel}>받은 포인트</span>
				<p className={`${styles.rowPrice} ${styles.earn}`}>+{pt(win.pointAmount)}</p>
			</div>
		</li>
	);
}
