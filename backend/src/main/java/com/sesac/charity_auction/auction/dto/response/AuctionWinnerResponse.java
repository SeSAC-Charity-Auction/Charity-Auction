package com.sesac.charity_auction.auction.dto.response;

/** 낙찰이 끝난 경매의 낙찰자예요. (auction_candidates에서 status가 COMPLETED인 후보) */
public record AuctionWinnerResponse(String nickname, long bidPrice) {
}
