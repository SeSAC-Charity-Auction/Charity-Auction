package com.sesac.charity_auction.point.dto;

import java.util.List;

public record PointPageResponse(
        List<PointEntryResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
