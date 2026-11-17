package com.sesac.charity_auction.auction.dto.response;

import java.util.List;

public record MyAuctionPageResponse(
        List<MyAuctionResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        long totalPoints // 지금까지 내 경매가 낙찰되어 판매자로서 받은 포인트 합계
) {
}
