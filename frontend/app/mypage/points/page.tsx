// app/mypage/points/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../../donations/fonts";
import styles from "../page.module.css";
import SearchParams from "./SearchParams";
import AllPoints from "./AllPoints";
export const metadata: Metadata = {
	title: "포인트 내역",
	description: "내 포인트 적립과 사용 내역을 모두 확인하세요.",
	robots: { index: false } // 개인 페이지라 검색에 노출하지 않아요
};

// 몇 번째 쪽인지(?page=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function AllPointsPage({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Link href="/mypage#points" className={styles.back}>
					마이페이지로 돌아가기
				</Link>
				<Suspense
					fallback={
						<p className={styles.loading} role="status">
							포인트 내역을 불러오는 중이에요.
						</p>
					}
				>
					<AllPoints searchParams={searchParams} />
				</Suspense>
			</main>
		</div>
	);
}
