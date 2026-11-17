import Link from "next/link";
import { connection } from "next/server";
import { getDonationPage } from "../data";
import DonationRow from "../donation-row";
import { display } from "../fonts";
import styles from "../page.module.css";

export default async function AllDonations({
	searchParams
}: {
	searchParams: Promise<{ page?: string | string[] }>;
}) {
	await connection();
	const raw = (await searchParams).page;
	const parsed = Number(Array.isArray(raw) ? raw[0] : raw);
	const pageIndex = Number.isInteger(parsed) && parsed >= 1 ? parsed - 1 : 0;
	const data = await getDonationPage(pageIndex);
	const current = data.page + 1;
	const hrefOf = (n: number) => `/donations/all?page=${n}`;
	return (
		<section aria-labelledby="all-title">
			<div className={styles.sectionHead}>
				<h1
					id="all-title"
					className={`${styles.h2} ${display.className}`}
				>
					전체 기부 목록
				</h1>
				<p className={styles.sectionNote}>
					모두 {data.totalElements.toLocaleString("ko-KR")}건 · 기부한
					사람의 이름은 일부만 보여요.
				</p>
			</div>
			{data.items.length > 0 ?
				<ol className={styles.donationList}>
					{data.items.map((record) => (
						<DonationRow key={record.donationId} record={record} />
					))}
				</ol>
			:	<p className={styles.empty}>
					{data.totalElements === 0 ?
						"아직 기부 기록이 없어요."
					:	"이 쪽에는 기부 기록이 없어요."}
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
