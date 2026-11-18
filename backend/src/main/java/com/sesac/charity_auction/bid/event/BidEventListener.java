package com.sesac.charity_auction.bid.event;

import com.sesac.charity_auction.bid.service.AuctionWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

// 이벤트 수신
@Component
@RequiredArgsConstructor
public class BidEventListener {

    private final AuctionWebSocketService auctionWebSocketService;

    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT) // DB 트랜잭션이 성공적으로 커밋된 이후에만 메시지를 전송
    public void handleBidCreated(final BidCreatedEvent event) {

        auctionWebSocketService.sendBidUpdate(event.auctionId(), event.response());
    }
}
