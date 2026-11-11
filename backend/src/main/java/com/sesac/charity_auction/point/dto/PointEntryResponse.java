package com.sesac.charity_auction.point.dto;

import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.domain.PointType;

import java.time.ZoneOffset;

public record PointEntryResponse(
        long pointId,
        String pointType,   // "적립" | "사용" (DB에는 EARN/USE로 저장)
        long pointAmount,
        String description, // donation_id / auction_id를 보고 서버가 만든 문구
        String createdAt
) {
    public static PointEntryResponse from(PointHistory h) {
        return new PointEntryResponse(
                h.getId(),
                h.getPointType().getLabel(),
                h.getPointAmount(),
                describe(h),
                h.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }

    private static String describe(PointHistory h) {
        if (h.getDonation() != null) {
            return h.getDonation().getTarget().getTargetName() + " 기부"; // 예: 푸른숲 어린이 도서관 기부
        }
        if (h.getAuctionId() != null) {
            return h.getPointType() == PointType.EARN ? "경매 판매 대금 적립" : "경매 낙찰 대금 사용";
        }
        return h.getPointType() == PointType.EARN ? "포인트 적립" : "포인트 사용";
    }
}
