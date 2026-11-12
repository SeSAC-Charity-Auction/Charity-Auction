package com.sesac.charity_auction.donation.dto;

import com.sesac.charity_auction.donation.domain.DonationTarget;

import java.time.ZoneOffset;

public record DonationTargetResponse(
        long targetId,
        String targetName,
        String description,
        String targetImage,
        boolean isActive,
        long totalDonation,
        long targetAmount,
        String createdAt
) {
    public static DonationTargetResponse from(final DonationTarget t) {
        return new DonationTargetResponse(
                t.getId(),
                t.getTargetName(),
                t.getDescription(),
                t.getTargetImage(),
                t.isActive(),
                t.getTotalDonation(),
                t.getTargetAmount(),
                // DB는 UTC로 저장돼 있으니 UTC임을 표시해서 ISO 8601로 내려줘요. (예: 2026-11-11T06:00:00Z)
                t.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
