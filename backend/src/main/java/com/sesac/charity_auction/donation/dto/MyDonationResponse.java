package com.sesac.charity_auction.donation.dto;

import com.sesac.charity_auction.donation.domain.Donation;

import java.time.ZoneOffset;

/** 내 기부 이력의 한 줄 */
public record MyDonationResponse(
        long donationId,
        long targetId,
        String targetName,
        String targetImage, // 기부처 대표 이미지 주소 (없으면 null)
        long donationAmount,
        String createdAt
) {
    public static MyDonationResponse from(final Donation d) {
        return new MyDonationResponse(
                d.getId(),
                d.getTarget().getId(),
                d.getTarget().getTargetName(),
                d.getTarget().getTargetImage(),
                d.getDonationAmount(),
                d.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }
}
