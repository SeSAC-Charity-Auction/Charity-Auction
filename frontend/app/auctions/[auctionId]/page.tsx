// app/auctions/[auctionId]/page.tsx : 경매 물품 상세
import type { Metadata } from "next";
import { Suspense } from "react";
import { body } from "../../donations/fonts";
import AuctionDetailContent from "./AuctionDetailContent";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";

export const metadata: Metadata = {
	title: "경매 상세"
};

// 주소의 [auctionId] 값(params)도 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function AuctionPage({
	params
}: {
	params: Promise<{ auctionId: string }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<AuctionDetailContent params={params} />
				</Suspense>
			</main>
		</div>
	);
}
