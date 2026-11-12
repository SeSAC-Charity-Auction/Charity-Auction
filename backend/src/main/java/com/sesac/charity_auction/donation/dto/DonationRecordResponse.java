package com.sesac.charity_auction.donation.dto;

import com.sesac.charity_auction.donation.domain.Donation;

import java.time.ZoneOffset;

public record DonationRecordResponse(
        long donationId,
        long targetId,
        String targetName,
        String donorName,
        long donationAmount,
        String createdAt
) {
    public static DonationRecordResponse from(final Donation d) {
        return new DonationRecordResponse(
                d.getId(),
                d.getTarget().getId(),
                d.getTarget().getTargetName(),
                d.getUser().getMaskedName(), // 이름은 서버에서 마스킹해서 내려줘요.
                d.getDonationAmount(),
                d.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
