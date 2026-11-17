package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.global.common.LocalTimes;

public record AuctionRegistrationResponse(
        long auctionId, String image, long startPrice, long currentPrice,
        String status, String startAt, String endAt
) {
    public static AuctionRegistrationResponse from(Auction auction) {
        return new AuctionRegistrationResponse(auction.getId(), auction.getImage(),
                auction.getStartPrice(), auction.getCurrentPrice(), auction.getStatus().name(),
                LocalTimes.toIsoInstant(auction.getStartAt()), LocalTimes.toIsoInstant(auction.getEndAt()));
    }
}
