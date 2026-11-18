package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.global.common.LocalTimes;


public record AuctionListResponse(
        Long auctionId,
        String title,
        String image,
        Long startPrice,
        Long currentPrice,
        Long bidCount,
        String startAt,
        String endAt,
        AuctionStatus status,
        Long categoryId,
        String categoryName
) {

    public static AuctionListResponse from(final Auction auction) {
        return new AuctionListResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getImage(),
                auction.getStartPrice(),
                auction.getCurrentPrice(),
                auction.getBidCount(),
                LocalTimes.toIsoInstant(auction.getStartAt()),
                LocalTimes.toIsoInstant(auction.getEndAt()),
                auction.getStatus(),
                auction.getCategory().getId(),
                auction.getCategory().getName()
        );
    }
}
