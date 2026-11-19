import Link from "next/link";
import MyCandidate from "../auctions/MyCandidate";
import formatDateTime from "../auctions/formatDateTime";
import { won } from "../donations/format";
import candidateLabel, { candidateNote } from "./candidateLabel";
import styles from "./page.module.css";
import pt from "./pt";
import Thumb from "./Thumb";

// 낙찰 기회 내역 한 줄: 내 입찰가와 순위, 결과
export default function CandidateRow({ candidate: c }: { candidate: MyCandidate }) {
	const note = candidateNote(c);
	const tone =
		c.status === "COMPLETED" ? styles.tagLive
		: c.status === "WAITING" ? styles.tagSoon
		: "";
	return (
		<li className={styles.row}>
			<Thumb image={c.image} title={c.title} />
			<div className={styles.rowBody}>
				<p className={styles.rowTitle}>
					<Link href={`/auctions/${c.auctionId}`} className={styles.rowLink}>
						{c.title}
					</Link>
				</p>
				<p className={styles.rowMeta}>
					<span>내 입찰가 {won(c.bidPrice)}</span>
					<span>{c.candidateRank}순위</span>
					{c.processedAtIso && <span>{formatDateTime(c.processedAtIso)}</span>}
				</p>
				{note && <p className={styles.rowMeta}>{note}</p>}
			</div>
			<div className={styles.rowSide}>
				<span className={`${styles.tag} ${tone}`}>{candidateLabel(c)}</span>
				{c.status === "COMPLETED" && (
					// 낙찰가의 50%를 포인트로 받아요. (백엔드와 같은 계산)
					<p className={`${styles.rowPoint} ${styles.earn}`}>
						+{pt(Math.floor(c.bidPrice / 2))}
					</p>
				)}
			</div>
		</li>
	);
}
