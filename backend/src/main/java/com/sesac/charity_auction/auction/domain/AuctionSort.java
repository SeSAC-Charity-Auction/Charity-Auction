package com.sesac.charity_auction.auction.domain;

public enum AuctionSort {
    LATEST, // 최신 등록순
    LOWEST_PRICE, // 현재 입찰가 낮은순
    HIGHEST_PRICE, // 현재 입찰가 높은순
    STARTING_SOON,   // 시작일 빠른순
    ENDING_SOON, // 마감 임박순
    MOST_BIDS // 입찰 많은순
}
