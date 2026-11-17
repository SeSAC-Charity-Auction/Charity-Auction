// app/page.tsx : 메인 페이지 (경매 물품 목록)
import type { Metadata } from "next";
import { Suspense } from "react";
import AuctionsContent from "./auctions/AuctionsContent";
import LoadingState from "./auctions/LoadingState";
import styles from "./auctions/page.module.css";
import SiteHeader from "./auctions/SiteHeader";
import { body } from "./donations/fonts";

export const metadata: Metadata = {
	title: "경매 물품"
};

// 카테고리·정렬·쪽 번호(?category=&sort=&page=)는 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function Home({
	searchParams
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<SiteHeader />
			<main className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<AuctionsContent searchParams={searchParams} />
				</Suspense>
			</main>
		</div>
	);
}
