package com.sesac.charity_auction.donation.domain;

/**
 * 기부 금액 규칙. 프론트의 frontend/app/donations/rules.ts와 같은 값이어야 해요.
 */
public final class DonationPolicy {

    public static final long MIN_AMOUNT = 100L; // 한 번에 기부할 수 있는 최소 포인트
    public static final long UNIT = 100L;         // 기부 금액 단위

    private DonationPolicy() {
    }

    public static boolean isValid(long amount) {
        return amount >= MIN_AMOUNT && amount % UNIT == 0;
    }
}
