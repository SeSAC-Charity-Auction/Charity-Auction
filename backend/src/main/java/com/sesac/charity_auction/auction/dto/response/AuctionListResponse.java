package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;

import java.time.LocalDateTime;

public record AuctionListResponse(
        Long auctionId,
        String title,
        String image,
        Long startPrice,
        Long currentPrice,
        Long bidCount,
        LocalDateTime startAt,
        LocalDateTime endAt,
        AuctionStatus status,
        Long categoryId,
        String categoryName
) {

    public static AuctionListResponse from(Auction auction){

        return new AuctionListResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getImage(),
                auction.getStartPrice(),
                auction.getCurrentPrice(),
                auction.getBidCount(),
                auction.getStartAt(),
                auction.getEndAt(),
                auction.getStatus(),
                auction.getCategory().getId(),
                auction.getCategory().getName()
        );
    }
}
