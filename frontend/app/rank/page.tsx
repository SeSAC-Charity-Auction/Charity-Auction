import type { Metadata } from "next";
import { Suspense } from "react";
import RankingContent from "./RankingContent";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "기부 랭킹",
	description: "나눔으로 이어진 포인트, 회원별 누적 기부 랭킹을 확인하세요."
};

export default function RankPage() {
	return (
		<main id="main-content" tabIndex={-1} className={styles.page}>
			<div className={styles.wrap}>
				<header className={styles.hero}>
					<p className={styles.eyebrow}>함께 쌓아가는 나눔</p>
					<h1>기부 랭킹</h1>
					<p className={styles.description}>경매에서 시작한 포인트가 나눔으로 이어졌어요.<br />지금까지 기부한 포인트를 기준으로 순위를 확인해 보세요.</p>
				</header>
				<Suspense fallback={<div className={styles.state} role="status" aria-live="polite">기부 랭킹을 불러오고 있어요…</div>}>
					<RankingContent />
				</Suspense>
			</div>
		</main>
	);
}
