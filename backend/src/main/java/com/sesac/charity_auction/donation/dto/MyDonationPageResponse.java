package com.sesac.charity_auction.donation.dto;

import java.util.List;

public record MyDonationPageResponse(
        List<MyDonationResponse> items, // 최근 기부가 먼저
        int page,
        int size,
        long totalElements,
        int totalPages,
        long totalAmount // 지금까지 기부한 포인트 전체 합계
) {
}
