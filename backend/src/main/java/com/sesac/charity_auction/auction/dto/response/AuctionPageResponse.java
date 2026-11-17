package com.sesac.charity_auction.auction.dto.response;

import java.util.List;

public record AuctionPageResponse(
        List<AuctionSummaryResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
