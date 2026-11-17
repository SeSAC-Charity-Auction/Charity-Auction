package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;

import java.time.ZoneOffset;

/** 경매 물품 목록의 한 칸이에요. 시간은 DB가 UTC라서 UTC 표시를 붙인 ISO 8601로 내려줘요. */
public record AuctionSummaryResponse(
        long auctionId,
        String title,
        String image,
        long categoryId,
        String categoryName,
        long startPrice,
        long currentPrice,
        long bidCount,
        String startAt,
        String endAt,
        String status
) {
    public static AuctionSummaryResponse from(final Auction a) {
        return new AuctionSummaryResponse(
                a.getId(),
                a.getTitle(),
                a.getImage(),
                a.getCategory().getId(),
                a.getCategory().getName(),
                a.getStartPrice(),
                a.getCurrentPrice(),
                a.getBidCount(),
                a.getStartAt().toInstant(ZoneOffset.UTC).toString(),
                a.getEndAt().toInstant(ZoneOffset.UTC).toString(),
                a.getStatus().name()
        );
    }
}
