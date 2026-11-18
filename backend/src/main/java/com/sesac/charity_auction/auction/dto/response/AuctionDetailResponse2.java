package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;

import java.time.LocalDateTime;

public record AuctionDetailResponse2(
        Long id,
        String title,
        String image,
        String description,
        Long startPrice,
        Long currentPrice,
        Long bidCount,
        LocalDateTime startAt,
        LocalDateTime endAt,
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
                auction.getStartAt(),
                auction.getEndAt(),
                auction.getStatus(),
                auction.getCategory().getId(),
                auction.getCategory().getName(),
                auction.getUser().getId()
        );
    }
}
