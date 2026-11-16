package com.sesac.charity_auction.donation.dto;

import java.util.List;

public record DonationPageResponse(
        List<DonationRecordResponse> items,
        int page,
        int size,
        long totalElements,
        int totalPages
) {
}
