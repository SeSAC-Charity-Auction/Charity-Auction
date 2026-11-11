package com.sesac.charity_auction.donation.dto;

import java.util.List;

public record DonationTargetDetailResponse(
        DonationTargetResponse target,
        long donorCount,
        long donationCount,
        List<DonationRecordResponse> recentDonations
) {
}
