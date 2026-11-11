package com.sesac.charity_auction.donation.dto;

/** POST /api/donations 요청 본문. 값이 빠졌는지도 서버가 직접 검사해요. */
public record DonationRequest(Long targetId, Long amount) {
}
