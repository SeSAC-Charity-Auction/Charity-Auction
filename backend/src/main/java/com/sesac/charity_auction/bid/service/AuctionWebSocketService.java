package com.sesac.charity_auction.bid.service;

import com.sesac.charity_auction.auction.dto.response.AuctionStatusMessage;
import com.sesac.charity_auction.auction.event.AuctionStatusChangedEvent;
import com.sesac.charity_auction.bid.dto.response.AuctionPriceUpdateResponse;
import com.sesac.charity_auction.bid.dto.response.BidRealtimeResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuctionWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    // 입찰 가격 변동
    public void sendBidUpdate(Long auctionId, BidRealtimeResponse response){

        // 메시지 전송
        // 특정 경매 상세 페이지 입찰 정보 전달
        messagingTemplate.convertAndSend("/topic/auctions/" + auctionId, response);

        // 전체 경매 목록에는 가격 및 입찰 수만 전달
        messagingTemplate.convertAndSend("/topic/auctions", AuctionPriceUpdateResponse.from(response));
    }

    // 경매 상태 변경 알림
    public void sendStatusChange(final AuctionStatusChangedEvent event) {
        final AuctionStatusMessage message = AuctionStatusMessage.from(event);

        // 경매 상세 화면
        messagingTemplate.convertAndSend("/topic/auctions/" + event.auctionId() + "/status", message);

        // 경매 목록 화면 (시작·마감·유찰·낙찰 완료만)
        if (event.affectsList()) { // 목록 화면에 영향을 주는 변화
            messagingTemplate.convertAndSend("/topic/auctions/status", message);
        }

        if (event.affectsOffers()) { // 사용자의 낙찰 기회에 영향을 주는 변화
            messagingTemplate.convertAndSend("/topic/offers", message);
        }
    }
}
