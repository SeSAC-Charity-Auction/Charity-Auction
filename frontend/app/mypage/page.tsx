// app/mypage/page.tsx
// 마이페이지: 내 정보, 기부 통계, 포인트 내역을 한 곳에서 보여줘요.
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../donations/fonts";
import LoadingState from "./LoadingState";
import MyPageContent from "./MyPageContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "마이페이지",
	description: "내 정보와 기부 통계, 포인트 내역, 내 경매 활동을 한 곳에서 확인하세요.",
	robots: { index: false } // 개인 페이지라 검색에 노출하지 않아요
};

export default function MyPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Link href="/donations" className={styles.back}>
					기부 현황으로 돌아가기
				</Link>
				<Suspense fallback={<LoadingState />}>
					<MyPageContent />
				</Suspense>
			</main>
		</div>
	);
}
