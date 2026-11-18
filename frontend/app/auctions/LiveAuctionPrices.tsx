"use client";

// 경매 목록의 카드들이 현재 입찰가·입찰 수를 실시간으로 바꿀 수 있게 해요.
// /topic/auctions 를 한 번만 구독하고, 받은 값을 경매 번호별로 들고 있어요.

import { createContext, useCallback, useContext, useState } from "react";
import FlipText from "../donations/FlipText";
import { won } from "../donations/format";
import useStompTopic from "../realtime/useStompTopic";
import AuctionPriceUpdateMessage from "./AuctionPriceUpdateMessage";

type Prices = Record<number, AuctionPriceUpdateMessage>;

const LivePricesContext = createContext<Prices>({});

export default function LiveAuctionPricesProvider({
	children
}: {
	children: React.ReactNode;
}) {
	const [prices, setPrices] = useState<Prices>({});
	const onMessage = useCallback((m: AuctionPriceUpdateMessage) => {
		setPrices((prev) => {
			const old = prev[m.auctionId];
			if (old && old.bidCount >= m.bidCount) return prev; // 늦게 온 옛 메시지
			return { ...prev, [m.auctionId]: m };
		});
	}, []);
	useStompTopic<AuctionPriceUpdateMessage>("/topic/auctions", onMessage);
	return (
		<LivePricesContext.Provider value={prices}>
			{children}
		</LivePricesContext.Provider>
	);
}

// 서버가 그린 값과 웹소켓 값 중 입찰 수가 더 많은(더 새) 쪽을 써요.
function useLatest(auctionId: number, currentPrice: number, bidCount: number) {
	const live = useContext(LivePricesContext)[auctionId];
	return live && live.bidCount > bidCount ? live : { currentPrice, bidCount };
}

export function LiveCardPriceLabel({
	auctionId,
	currentPrice,
	bidCount,
	closed
}: {
	auctionId: number;
	currentPrice: number;
	bidCount: number;
	closed: boolean;
}) {
	const latest = useLatest(auctionId, currentPrice, bidCount);
	return (
		<>
			{latest.bidCount > 0 ?
				closed ? "최종 입찰가" : "현재 입찰가"
			:	"시작 가격"}
		</>
	);
}

export function LiveCardPrice({
	auctionId,
	currentPrice,
	bidCount
}: {
	auctionId: number;
	currentPrice: number;
	bidCount: number;
}) {
	const latest = useLatest(auctionId, currentPrice, bidCount);
	return <FlipText text={won(latest.currentPrice)} />;
}

export function LiveCardBidCount({
	auctionId,
	currentPrice,
	bidCount
}: {
	auctionId: number;
	currentPrice: number;
	bidCount: number;
}) {
	const latest = useLatest(auctionId, currentPrice, bidCount);
	return <FlipText text={`${latest.bidCount.toLocaleString("ko-KR")}회`} />;
}
