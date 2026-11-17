import Link from "next/link";
import MyWinPage from "../auctions/MyWinPage";
import { display } from "../donations/fonts";
import MyWinRow from "./MyWinRow";
import styles from "./page.module.css";
import pt from "./pt";

// 마이페이지의 "낙찰 이력" (최근 몇 건과, 낙찰로 받은 포인트 합계)
export default function MyWinsSection({ data }: { data: MyWinPage }) {
	return (
		<section id="my-wins" aria-labelledby="my-wins-title">
			<div className={styles.sectionHead}>
				<h2
					id="my-wins-title"
					className={`${styles.h2} ${display.className}`}
				>
					낙찰 이력
				</h2>
				<div className={styles.sectionSide}>
					<p className={styles.muted}>
						모두 {data.totalElements.toLocaleString("ko-KR")}건 · 낙찰로 받은 포인트{" "}
						<strong>{pt(data.totalPoints)}</strong>
					</p>
					{data.totalElements > data.items.length && (
						<Link
							href="/mypage/activity?tab=wins"
							className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
						>
							전체 조회
						</Link>
					)}
				</div>
			</div>
			{data.items.length > 0 ?
				<ul className={styles.rowList}>
					{data.items.map((w) => (
						<MyWinRow key={w.auctionId} win={w} />
					))}
				</ul>
			:	<p className={styles.empty}>
					아직 낙찰받은 경매가 없어요. 낙찰받으면 낙찰가의 50%를 포인트로
					돌려받아요.
				</p>
			}
		</section>
	);
}
