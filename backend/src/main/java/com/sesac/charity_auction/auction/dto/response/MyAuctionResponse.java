package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.global.common.LocalTimes;

/** 내가 올린 경매 한 건이에요. 목록의 한 칸과 같은 값에, 판매로 받은 포인트가 더해져요. */
public record MyAuctionResponse(
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
        String status,
        long pointAmount // 이 경매가 낙찰되어 판매자로서 받은 포인트 (아직이면 0)
) {
    public static MyAuctionResponse of(final Auction a, final long pointAmount) {
        return new MyAuctionResponse(
                a.getId(),
                a.getTitle(),
                a.getImage(),
                a.getCategory().getId(),
                a.getCategory().getName(),
                a.getStartPrice(),
                a.getCurrentPrice(),
                a.getBidCount(),
                LocalTimes.toIsoInstant(a.getStartAt()),
                LocalTimes.toIsoInstant(a.getEndAt()),
                a.getStatus().name(),
                pointAmount
        );
    }
}
