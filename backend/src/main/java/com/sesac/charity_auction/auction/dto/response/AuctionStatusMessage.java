package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.event.AuctionStatusChangedEvent;

// 웹소켓용 상태 변경 알림
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
