// app/mypage/offers/page.tsx : 낙찰 기회 (지금 선택할 기회, 순번 대기, 지난 기록)
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../../donations/fonts";
import styles from "../page.module.css";
import OffersContent from "./OffersContent";
import SearchParams from "./SearchParams";

export const metadata: Metadata = {
	title: "내가 받은 낙찰 기회",
	description: "받은 낙찰 기회를 수락하거나 포기하고, 지난 기록을 확인하세요.",
	robots: { index: false } // 개인 페이지라 검색에 노출하지 않아요
};

// 어떤 기록 탭인지(?tab=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function OffersPage({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
				<Link href="/mypage" className={styles.back}>
					마이페이지로 돌아가기
				</Link>
				<Suspense
					fallback={
						<p className={styles.loading} role="status">
							불러오는 중이에요.
						</p>
					}
				>
					<OffersContent searchParams={searchParams} />
				</Suspense>
			</main>
		</div>
	);
}
