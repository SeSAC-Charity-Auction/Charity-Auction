// app/donations/all/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../fonts";
import styles from "../page.module.css";
import AllDonations from "./AllDonations";

export const metadata: Metadata = {
	title: "전체 기부 목록",
	description: "가치잇다에서 이루어진 모든 기부 내역을 최신순으로 확인하세요."
};

// 몇 번째 쪽인지(?page=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function AllDonationsPage({
	searchParams
}: {
	searchParams: Promise<{ page?: string | string[] }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
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
