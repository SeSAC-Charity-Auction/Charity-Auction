// app/mypage/activity/page.tsx : 내가 올린 경매 / 낙찰 이력 전체 보기
import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../../donations/fonts";
import styles from "../page.module.css";
import ActivityContent from "./ActivityContent";
import SearchParams from "./SearchParams";

export const metadata: Metadata = {
	title: "내 경매 활동"
};

// 어떤 탭인지(?tab=)와 몇 번째 쪽인지(?page=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function ActivityPage({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
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
					<ActivityContent searchParams={searchParams} />
				</Suspense>
			</main>
		</div>
	);
}
