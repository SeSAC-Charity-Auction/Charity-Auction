package com.sesac.charity_auction.point.repository;

public interface DonationRankingProjection {
    long getUserId();

    String getNickname();

    String getUserImage();

    long getTotalDonation();

    long getDonationCount();
}
