import { display } from "@/app/donations/fonts";
import getMyPointPage from "@/app/donations/getMyPointPage";
import Link from "next/link";
import { connection } from "next/server";
import EntryRow from "../entry-row";
import styles from "../page.module.css";
import SearchParams from "./SearchParams";

export default async function AllPoints({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	await connection();
	const raw = (await searchParams).page;
	const parsed = Number(Array.isArray(raw) ? raw[0] : raw);
	const pageIndex = Number.isInteger(parsed) && parsed >= 1 ? parsed - 1 : 0;
	const data = await getMyPointPage(pageIndex);
	if (!data) {
		return (
			<p className={styles.empty}>
				로그인하면 포인트 내역을 볼 수 있어요.{" "}
				<Link href="/login" className={styles.textLink}>
					로그인하기
				</Link>
			</p>
		);
	}
	const current = data.page + 1;
	const hrefOf = (n: number) => `/mypage/points?page=${n}`;
	return (
		<section aria-labelledby="all-points-title">
			<div className={styles.sectionHead}>
				<h1
					id="all-points-title"
					className={`${styles.h2} ${display.className}`}
				>
					포인트 내역 전체
				</h1>
				<p className={styles.muted}>
					모두 {data.totalElements.toLocaleString("ko-KR")}건
				</p>
			</div>
			{data.items.length > 0 ?
				<ol className={styles.entryList}>
					{data.items.map((e) => (
						<EntryRow key={e.pointId} entry={e} />
					))}
				</ol>
			:	<p className={styles.empty}>
					{data.totalElements === 0 ?
						"아직 포인트 내역이 없어요."
					:	"이 쪽에는 포인트 내역이 없어요."}
				</p>
			}
			{data.totalPages > 1 && (
				<nav className={styles.pager} aria-label="쪽 이동">
					<Link
						href={hrefOf(current - 1)}
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
						href={hrefOf(current + 1)}
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
