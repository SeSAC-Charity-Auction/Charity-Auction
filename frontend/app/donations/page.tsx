// app/donations/page.tsx
import type { Metadata } from "next";
import { Suspense } from "react";
import DonationsContent from "./DonationsContent";
import { body } from "./fonts";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "기부 현황",
	description:
		"가치잇다의 기부처를 둘러보고 포인트로 기부하세요. 최근 기부와 기부 랭킹도 볼 수 있어요."
};

export default function DonationsPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<DonationsContent />
				</Suspense>
			</main>
		</div>
	);
}
