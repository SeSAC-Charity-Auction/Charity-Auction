package com.sesac.charity_auction.auction.event;

import com.sesac.charity_auction.auction.domain.AuctionStatus;

/**
 * 경매 상태가 바뀌었을 때 발생하는 이벤트예요.
 * DB 트랜잭션이 커밋된 뒤 AuctionStatusEventListener가 웹소켓으로 알려줘요.
 */
public record AuctionStatusChangedEvent(Long auctionId, AuctionStatus status, Reason reason) {

    public enum Reason {
        STARTED,     // 예정 → 진행 중
        CLOSED,      // 진행 중 → 마감 (1순위에게 낙찰 기회)
        FAILED,      // 유찰 (입찰자 없음, 또는 모든 후보 포기·만료)
        COMPLETED,   // 낙찰 완료
        OFFER_MOVED  // 앞 순위 포기·만료로 다음 순위에게 기회가 넘어감 (경매 상태는 그대로 CLOSED)
    }

    // 목록 화면에 영향을 주는 변화인지. (다음 순위로 넘어가는 건 목록에서 보이는 게 없어요)
    public boolean affectsList() {
        return reason != Reason.OFFER_MOVED;
    }

    // 사용자의 낙찰 기회에 영향을 주는 변화인지. (경매 시작은 낙찰 기회와 상관없어요)
    public boolean affectsOffers() {
        return reason != Reason.STARTED;
    }
}
