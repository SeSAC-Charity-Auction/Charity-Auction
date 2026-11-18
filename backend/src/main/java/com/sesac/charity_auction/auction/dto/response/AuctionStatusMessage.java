package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.event.AuctionStatusChangedEvent;

/** 웹소켓으로 보내는 경매 상태 변경 알림이에요. 화면은 이걸 받으면 최신 정보를 다시 불러와요. */
public record AuctionStatusMessage(
        Long auctionId,
        String status, // AuctionStatus 이름 (예: IN_PROGRESS, CLOSED)
        String reason  // STARTED / CLOSED / FAILED / COMPLETED / OFFER_MOVED
) {
    public static AuctionStatusMessage from(final AuctionStatusChangedEvent event) {
        return new AuctionStatusMessage(
                event.auctionId(),
                event.status().name(),
                event.reason().name()
        );
    }
}
