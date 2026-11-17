// app/mypage/page.tsx
// 마이페이지: 내 정보, 기부 통계, 포인트 내역을 한 곳에서 보여줘요.
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../donations/fonts";
import LoadingState from "./LoadingState";
import MyPageContent from "./MyPageContent";
import styles from "./page.module.css";
import SiteHeader from "../SiteHeader";

export default function MyPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<SiteHeader current="mypage" />
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
