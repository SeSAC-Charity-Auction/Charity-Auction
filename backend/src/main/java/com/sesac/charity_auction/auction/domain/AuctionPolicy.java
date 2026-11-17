package com.sesac.charity_auction.auction.domain;

/** 경매 등록 규칙이에요. (ERD의 start_price 기본값 100과 같아요) */
public final class AuctionPolicy {
    /** 시작 가격을 정하지 않았을 때의 기본값이자, 정할 수 있는 가장 낮은 값이에요. */
    public static final long MIN_START_PRICE = 100L;
    public static final long DEFAULT_START_PRICE = MIN_START_PRICE;

    private AuctionPolicy() {
    }
}
