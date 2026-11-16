package com.sesac.charity_auction.auctioncandidate.domain;

public enum AuctionCandidateStatus {
    WAITING,    // 낙찰 대기
    OFFERED,    // 낙찰 기회 부여
    COMPLETED,  // 낙찰 완료
    EXPIRED,    // 낙찰 기한 만료
    REJECTED,    // 낙찰 포기
    NOT_SELECTED   // 다른 후보자의 낙찰 완료로 기회 종료
}
