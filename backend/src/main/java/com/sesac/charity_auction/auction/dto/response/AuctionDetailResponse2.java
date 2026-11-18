package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.global.common.LocalTimes;


public record AuctionDetailResponse2(
        Long id,
        String title,
        String image,
        String description,
        Long startPrice,
        Long currentPrice,
        Long bidCount,
        String startAt,
        String endAt,
        AuctionStatus status,
        Long categoryId,
        String categoryName,
        Long userId
) {
    public static AuctionDetailResponse2 from(final Auction auction) {
        return new AuctionDetailResponse2(
                auction.getId(),
                auction.getTitle(),
                auction.getImage(),
                auction.getDescription(),
                auction.getStartPrice(),
                auction.getCurrentPrice(),
                auction.getBidCount(),
                LocalTimes.toIsoInstant(auction.getStartAt()),
                LocalTimes.toIsoInstant(auction.getEndAt()),
                auction.getStatus(),
                auction.getCategory().getId(),
                auction.getCategory().getName(),
                auction.getUser().getId()
        );
    }
}
