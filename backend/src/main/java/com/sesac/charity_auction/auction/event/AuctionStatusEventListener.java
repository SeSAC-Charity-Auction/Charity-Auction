package com.sesac.charity_auction.auction.event;

import com.sesac.charity_auction.bid.service.AuctionWebSocketService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.transaction.event.TransactionPhase;
import org.springframework.transaction.event.TransactionalEventListener;

@Component
@RequiredArgsConstructor
public class AuctionStatusEventListener {

    private final AuctionWebSocketService auctionWebSocketService;

    // DB 커밋이 끝난 뒤에만 보내요. (커밋 전에 보내면 화면이 다시 불러와도 옛 상태가 보일 수 있어요)
    // fallbackExecution: 트랜잭션 밖에서 발행돼도 보내요.
    @TransactionalEventListener(phase = TransactionPhase.AFTER_COMMIT, fallbackExecution = true)
    public void handle(final AuctionStatusChangedEvent event) {
        auctionWebSocketService.sendStatusChange(event);
    }
}
