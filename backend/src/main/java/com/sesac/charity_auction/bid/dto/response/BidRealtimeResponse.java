package com.sesac.charity_auction.bid.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.global.common.LocalTimes;

public record BidRealtimeResponse(
        Long bidId,
        Long auctionId,
        String nickname,
        Long bidPrice,
        String bidAt, // 경매 상세(BidHistoryItemResponse)와 같은 UTC ISO 8601 형식 (예: 2026-11-17T03:49:20Z)
        Long currentPrice,
        Long bidCount
) {

    public static BidRealtimeResponse from(Bid bid, Auction auction){

        return new BidRealtimeResponse(
                bid.getId(),
                bid.getAuction().getId(),
                bid.getUser().getNickname(),
                bid.getBidPrice(),
                LocalTimes.toIsoInstant(bid.getBidAt()),
                auction.getCurrentPrice(),
                auction.getBidCount()
        );
    }
}
