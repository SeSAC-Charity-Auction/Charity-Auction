package com.sesac.charity_auction.donation.dto;

/** 기부 성공 응답: 기부한 금액과 기부 후 남은 포인트 */
public record DonationResponse(long amount, long balance) {
}
