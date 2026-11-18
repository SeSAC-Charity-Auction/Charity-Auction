"use client";

// 경매 상세의 "지금 값"(현재 입찰가·입찰 수·최근 입찰)을 웹소켓으로 받아 화면 곳곳에 나눠 줘요.
// 처음 값은 서버가 그린 값이고, 이후 /topic/auctions/{auctionId} 메시지가 오면 바뀌어요.

import { createContext, useCallback, useContext, useState } from "react";
import type { SocketStatus } from "../../realtime/stompClient";
import useStompTopic from "../../realtime/useStompTopic";
import BidHistoryItem from "../BidHistoryItem";
import BidRealtimeMessage from "../BidRealtimeMessage";

type Snapshot = {
	currentPrice: number;
	bidCount: number;
	recentBids: BidHistoryItem[]; // 최신순
};

type LiveAuctionValue = Snapshot & { socket: SocketStatus };

const LiveAuctionContext = createContext<LiveAuctionValue | null>(null);

/** LiveAuctionProvider 안에서만 값이 있어요. 밖에서는 null이에요. */
export function useLiveAuction() {
	return useContext(LiveAuctionContext);
}

export default function LiveAuctionProvider({
	auctionId,
	initial,
	historySize,
	children
}: {
	auctionId: number;
	initial: Snapshot; // 서버가 방금 그린 값
	historySize: number; // 최근 입찰을 몇 건까지 보여줄지
	children: React.ReactNode;
}) {
	// 웹소켓으로 받은 값이에요. 서버가 다시 그려서(router.refresh 등) 더 새 값을 주면 그쪽을 써요.
	const [live, setLive] = useState<Snapshot | null>(null);
	const current = live && live.bidCount > initial.bidCount ? live : initial;

	const onMessage = useCallback(
		(m: BidRealtimeMessage) => {
			if (m.auctionId !== auctionId) return;
			setLive((prev) => {
				const base = prev && prev.bidCount > initial.bidCount ? prev : initial;
				// 늦게 도착한 옛 메시지는 무시해요.
				if (m.bidCount <= base.bidCount) return prev;
				if (base.recentBids.some((b) => b.bidId === m.bidId)) return prev;
				const bid: BidHistoryItem = {
					bidId: m.bidId,
					nickname: m.nickname,
					bidPrice: m.bidPrice,
					bidAt: m.bidAt
				};
				return {
					currentPrice: m.currentPrice,
					bidCount: m.bidCount,
					recentBids: [bid, ...base.recentBids].slice(0, historySize)
				};
			});
		},
		[auctionId, initial, historySize]
	);

	const socket = useStompTopic<BidRealtimeMessage>(
		`/topic/auctions/${auctionId}`,
		onMessage
	);

	return (
		<LiveAuctionContext.Provider value={{ ...current, socket }}>
			{children}
		</LiveAuctionContext.Provider>
	);
}
