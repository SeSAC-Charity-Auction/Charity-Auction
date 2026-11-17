package com.sesac.charity_auction.auction.dto.response;

public record AuctionListResponse(
        Long auctionId,
        String title,
        Long finalPrice // 최종 낙찰 금액
) {
}
