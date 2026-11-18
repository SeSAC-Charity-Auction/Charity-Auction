// app/auctions/[auctionId]/page.tsx : 경매 물품 상세
import type { Metadata } from "next";
import { Suspense } from "react";
import { body } from "../../donations/fonts";
import getAuction from "../getAuction";
import AuctionDetailContent from "./AuctionDetailContent";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";

// 경매 이름과 설명으로 제목·미리보기를 만들어요. (없는 경매면 기본 제목을 써요)
export async function generateMetadata({
	params
}: {
	params: Promise<{ auctionId: string }>;
}): Promise<Metadata> {
	const id = Number((await params).auctionId);
	if (!Number.isInteger(id) || id <= 0) return { title: "경매 상세" };
	const auction = await getAuction(id).catch(() => null);
	if (!auction) return { title: "경매 상세" };
	const description =
		auction.description?.trim().slice(0, 150) ||
		`${auction.categoryName} 경매예요. 낙찰금은 기부로 이어져요.`;
	return {
		title: auction.title,
		description,
		openGraph: {
			title: auction.title,
			description,
			images: auction.image ? [auction.image] : undefined
		}
	};
}

// 주소의 [auctionId] 값(params)도 요청이 와야 알 수 있어서 <Suspense> 안에서 읽어요.
export default function AuctionPage({
	params
}: {
	params: Promise<{ auctionId: string }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<AuctionDetailContent params={params} />
				</Suspense>
			</main>
		</div>
	);
}
