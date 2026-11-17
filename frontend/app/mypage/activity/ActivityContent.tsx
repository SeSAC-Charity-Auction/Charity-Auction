import Link from "next/link";
import { connection } from "next/server";
import getMyAuctions from "../../auctions/getMyAuctions";
import getMyWins from "../../auctions/getMyWins";
import { display } from "../../donations/fonts";
import MyAuctionRow from "../MyAuctionRow";
import MyWinRow from "../MyWinRow";
import styles from "../page.module.css";
import pt from "../pt";
import SearchParams from "./SearchParams";

const first = (v: string | string[] | undefined) =>
	Array.isArray(v) ? v[0] : v;

export default async function ActivityContent({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	await connection();
	const params = await searchParams;
	const tab = first(params.tab) === "wins" ? "wins" : "auctions";
	const parsed = Number(first(params.page));
	const pageIndex = Number.isInteger(parsed) && parsed >= 1 ? parsed - 1 : 0;
	const wins = tab === "wins" ? await getMyWins(pageIndex) : null;
	const auctions = tab === "auctions" ? await getMyAuctions(pageIndex) : null;
	const data = wins ?? auctions;
	if (!data) {
		return (
			<p className={styles.empty}>
				로그인하면 내 경매 활동을 볼 수 있어요.{" "}
				<Link href="/login" className={styles.textLink}>
					로그인하기
				</Link>
			</p>
		);
	}
	const current = data.page + 1;
	const hrefOf = (t: string, n = 1) =>
		`/mypage/activity?tab=${t}${n > 1 ? `&page=${n}` : ""}`;
	return (
		<section aria-labelledby="activity-title">
			<div className={styles.sectionHead}>
				<h1
					id="activity-title"
					className={`${styles.h2} ${display.className}`}
				>
					내 경매 활동
				</h1>
				<p className={styles.muted}>
					모두 {data.totalElements.toLocaleString("ko-KR")}건 ·{" "}
					{wins ? "낙찰로" : "판매로"} 받은 포인트{" "}
					<strong>{pt(data.totalPoints)}</strong>
				</p>
			</div>
			<nav aria-label="보기 선택" className={styles.tabs}>
				<Link
					href={hrefOf("auctions")}
					className={`${styles.tab} ${tab === "auctions" ? styles.tabOn : ""}`}
					aria-current={tab === "auctions" ? "page" : undefined}
				>
					내가 올린 경매
				</Link>
				<Link
					href={hrefOf("wins")}
					className={`${styles.tab} ${tab === "wins" ? styles.tabOn : ""}`}
					aria-current={tab === "wins" ? "page" : undefined}
				>
					낙찰 이력
				</Link>
			</nav>
			{data.items.length > 0 ?
				<ul className={styles.rowList}>
					{wins ?
						wins.items.map((w) => (
							<MyWinRow key={w.auctionId} win={w} />
						))
					:	auctions?.items.map((a) => (
							<MyAuctionRow key={a.auctionId} auction={a} />
						))
					}
				</ul>
			:	<p className={styles.empty}>
					{data.totalElements === 0 ?
						tab === "wins" ?
							"아직 낙찰받은 경매가 없어요."
						:	"아직 올린 경매가 없어요."
					:	"이 쪽에는 내용이 없어요."}
				</p>
			}
			{data.totalPages > 1 && (
				<nav className={styles.pager} aria-label="쪽 이동">
					<Link
						href={hrefOf(tab, current - 1)}
						className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall} ${current <= 1 ? styles.btnDisabled : ""}`}
						aria-disabled={current <= 1}
						tabIndex={current <= 1 ? -1 : undefined}
					>
						이전
					</Link>
					<span className={styles.pagerInfo}>
						{current} / {data.totalPages}
					</span>
					<Link
						href={hrefOf(tab, current + 1)}
						className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall} ${current >= data.totalPages ? styles.btnDisabled : ""}`}
						aria-disabled={current >= data.totalPages}
						tabIndex={current >= data.totalPages ? -1 : undefined}
					>
						다음
					</Link>
				</nav>
			)}
		</section>
	);
}
