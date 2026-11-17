import Link from "next/link";
import MyAuctionPage from "../auctions/MyAuctionPage";
import { display } from "../donations/fonts";
import MyAuctionRow from "./MyAuctionRow";
import styles from "./page.module.css";
import pt from "./pt";

// 마이페이지의 "내가 올린 경매" (최근 몇 건만 보여주고, 전체는 따로 보게 해요)
export default function MyAuctionsSection({ data }: { data: MyAuctionPage }) {
	return (
		<section id="my-auctions" aria-labelledby="my-auctions-title">
			<div className={styles.sectionHead}>
				<h2
					id="my-auctions-title"
					className={`${styles.h2} ${display.className}`}
				>
					내가 올린 경매
				</h2>
				<div className={styles.sectionSide}>
					<p className={styles.muted}>
						모두 {data.totalElements.toLocaleString("ko-KR")}건 · 판매로 받은 포인트{" "}
						<strong>{pt(data.totalPoints)}</strong>
					</p>
					{data.totalElements > data.items.length && (
						<Link
							href="/mypage/activity?tab=auctions"
							className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
						>
							전체 조회
						</Link>
					)}
				</div>
			</div>
			{data.items.length > 0 ?
				<ul className={styles.rowList}>
					{data.items.map((a) => (
						<MyAuctionRow key={a.auctionId} auction={a} />
					))}
				</ul>
			:	<p className={styles.empty}>아직 올린 경매가 없어요.</p>}
		</section>
	);
}
