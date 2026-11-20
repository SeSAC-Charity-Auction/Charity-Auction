package com.sesac.charity_auction.auction.event;

import com.sesac.charity_auction.auction.domain.AuctionStatus;

// 프론트에서 경매 상태 변경을 감지하기 위해 경매 상태 변경시 이벤트 발생
public record AuctionStatusChangedEvent(Long auctionId, AuctionStatus status, Reason reason) {

    public enum Reason {
        STARTED,     // 예정 → 진행 중
        CLOSED,      // 진행 중 → 마감 (1순위에게 낙찰 기회)
        FAILED,      // 유찰
        COMPLETED,   // 낙찰 완료
        OFFER_MOVED  // 앞 순위 포기·만료로 다음 순위에게 기회가 넘어감 (경매 상태는 그대로 CLOSED)
    }

    // 목록 화면에 영향을 주는 변화인지 체크
    public boolean affectsList() {
        return reason != Reason.OFFER_MOVED;
    }

    // 사용자의 낙찰 기회에 영향을 주는 변화인지 체크
    public boolean affectsOffers() {
        return reason != Reason.STARTED;
    }
}
