package com.sesac.charity_auction.bid.dto.response;

import com.sesac.charity_auction.bid.entity.Bid;

import java.time.LocalDateTime;

public record BidCreateResponse(
        Long bidId,
        Long auctionId,
        Long bidPrice,
        LocalDateTime bidAt,
        Long currentPrice,
        Long bidCount

) {
    public static BidCreateResponse from(Bid bid, Long currentPrice, Long bidCount){

        return new BidCreateResponse(
                bid.getId(),
                bid.getAuction().getId(),
                bid.getBidPrice(),
                bid.getBidAt(),
                currentPrice,
                bidCount
            );
    }
}
