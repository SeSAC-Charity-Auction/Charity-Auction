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
    public static PointEntryResponse from(final PointHistory history) {
        return new PointEntryResponse(
                history.getId(),
                history.getPointType().getLabel(),
                history.getPointAmount(),
                describe(history),
                history.getCreatedAt().toInstant(ZoneOffset.UTC).toString()
        );
    }

    private static String describe(final PointHistory history) {
        if (history.getDonation() != null) {
            return history.getDonation().getTarget().getTargetName() + " 기부"; // 예: 푸른숲 어린이 도서관 기부
        }
        if (history.getAuction() != null) {
            // 경매 이름을 같이 보여줘요. 낙찰자(구매자)와 판매자는 받는 이유가 달라서 문구를 나눠요.
            // (예: 미개봉 무선 이어폰 낙찰 포인트 / 미개봉 무선 이어폰 판매 포인트)
            final String title = history.getAuction().getTitle();
            if (history.getPointType() == PointType.EARN) {
                final boolean seller = history.getAuction().getUser().getId().equals(history.getUser().getId());
                return title + (seller ? " 판매 포인트" : " 낙찰 포인트");
            }
            return title + " 낙찰 대금 사용";
        }
        return history.getPointType() == PointType.EARN ? "포인트 적립" : "포인트 사용";
    }
}
