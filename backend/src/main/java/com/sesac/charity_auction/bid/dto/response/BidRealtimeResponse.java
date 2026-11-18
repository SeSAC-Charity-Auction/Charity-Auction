package com.sesac.charity_auction.bid.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.bid.entity.Bid;

import java.time.LocalDateTime;

public record BidRealtimeResponse(
        Long bidId,
        Long auctionId,
        String nickname,
        Long bidPrice,
        LocalDateTime bidAt,
        Long currentPrice,
        Long bidCount
) {

    public static BidRealtimeResponse from(Bid bid, Auction auction){

        return new BidRealtimeResponse(
                bid.getId(),
                bid.getAuction().getId(),
                bid.getUser().getNickname(),
                bid.getBidPrice(),
                bid.getBidAt(),
                auction.getCurrentPrice(),
                auction.getBidCount()
        );
    }
}
