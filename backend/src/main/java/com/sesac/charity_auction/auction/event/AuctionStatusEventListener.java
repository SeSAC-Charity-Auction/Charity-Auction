package com.sesac.charity_auction.auction.event;

import com.sesac.charity_auction.bid.service.AuctionWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class AuctionStatusEventListener { // 경매 상태 변경시 발행되는 이벤트를 감지

    private final AuctionWebSocketService auctionWebSocketService;

    // 특정 시점(커밋 이후)에 이벤트 처리
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true) // 트랜잭션이 정상적으로 처리된 이후에 이벤트를 처리
    public void handle(final AuctionStatusChangedEvent event) {
        auctionWebSocketService.sendStatusChange(event);
    }
}
