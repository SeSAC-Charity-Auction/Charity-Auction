package com.sesac.charity_auction.donation.dto;

import java.util.List;

public record DonationSummaryResponse(
        long totalDonation,
        long donationCount,
        long donorCount,
        List<DonationTargetResponse> targets,
        List<DonationRecordResponse> recentDonations
) {
}
