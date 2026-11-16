// app/donations/all/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import { getDonationPage } from "../data";
import DonationRow from "../donation-row";
import { body, display } from "../fonts";
import styles from "../page.module.css";

export const metadata: Metadata = {
	title: "전체 기부 목록"
};

// 몇 번째 쪽인지(?page=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function AllDonationsPage({
	searchParams
}: {
	searchParams: Promise<{ page?: string | string[] }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Link href="/donations" className={styles.back}>
					기부 현황으로 돌아가기
				</Link>
				<Suspense
					fallback={
						<p className={styles.loading} role="status">
							기부 목록을 불러오는 중이에요.
						</p>
					}
				>
					<AllDonations searchParams={searchParams} />
				</Suspense>
			</main>
		</div>
	);
}

async function AllDonations({
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
