package com.sesac.charity_auction.donation.dto;

public record DonationRankingResponse(
        long rank,
        long userId,
        String nickname,
        String userImage,
        long totalDonation,
        long donationCount
) {
}
