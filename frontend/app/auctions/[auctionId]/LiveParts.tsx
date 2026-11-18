"use client";

// 경매 상세에서 실시간으로 바뀌는 작은 조각들이에요. (LiveAuctionProvider 안에서 써요)

import FlipText from "../../donations/FlipText";
import { won } from "../../donations/format";
import BidHistory from "./BidHistory";
import { useLiveAuction } from "./LiveAuction";
import styles from "./page.module.css";

export function LivePriceLabel({ fallbackBidCount }: { fallbackBidCount: number }) {
	const bidCount = useLiveAuction()?.bidCount ?? fallbackBidCount;
	return <>{bidCount > 0 ? "현재 입찰가" : "시작 가격"}</>;
}

export function LivePrice({ fallback }: { fallback: number }) {
	const price = useLiveAuction()?.currentPrice ?? fallback;
	return <FlipText text={won(price)} />;
}

export function LiveBidCount({ fallback }: { fallback: number }) {
	const bidCount = useLiveAuction()?.bidCount ?? fallback;
	return <FlipText text={`${bidCount.toLocaleString("ko-KR")}회`} />;
}

export function LiveBidHistory({ live }: { live: boolean }) {
	const auction = useLiveAuction();
	if (!auction) return null;
	return (
		<>
			<BidHistory bids={auction.recentBids} total={auction.bidCount} />
			{/* 진행 중인 경매에서 연결이 끊겼을 때만 알려요. */}
			{live && auction.socket === "reconnecting" && (
				<p className={styles.muted} role="status">
					실시간 연결이 끊겨 다시 연결하는 중이에요. 새 입찰은 연결되면 바로
					보여요.
				</p>
			)}
		</>
	);
}
