package com.sesac.charity_auction.auction.dto.response;

import java.util.List;

public record MyWinPageResponse(
        List<MyWinResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages,
        long totalPoints // 지금까지 낙찰로 받은 포인트 전체 합계
) {
}
