package com.sesac.charity_auction.bid.dto.response;

import com.sesac.charity_auction.bid.entity.Bid;

import java.time.LocalDateTime;

public record BidListResponse(
        Long bidId,
        String nickname,
        Long bidPrice,
        LocalDateTime bidAt
) {
    public static BidListResponse from(final Bid bid) {
        return new BidListResponse(
                bid.getId(),
                bid.getUser().getNickname(),
                bid.getBidPrice(),
                bid.getBidAt()
        );
    }
}
