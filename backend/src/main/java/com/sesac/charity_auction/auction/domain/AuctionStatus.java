package com.sesac.charity_auction.auction.domain;

public enum AuctionStatus {
    SCHEDULED,   // 예정
    IN_PROGRESS, // 진행
    CLOSED,       // 종료
    COMPLETED,  // 완료
    FAILED,      // 실패(유찰)
    CANCELED     // 취소(삭제)
}
