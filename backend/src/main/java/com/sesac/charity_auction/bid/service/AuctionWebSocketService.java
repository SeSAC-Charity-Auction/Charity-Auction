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

        // 경매 상세 화면 (다음 순위로 기회가 넘어가는 것까지 모두)
        messagingTemplate.convertAndSend("/topic/auctions/" + event.auctionId() + "/status", message);

        // 경매 목록 화면 (시작·마감·유찰·낙찰 완료만)
        if (event.affectsList()) {
            messagingTemplate.convertAndSend("/topic/auctions/status", message);
        }

        // 낙찰 기회가 생기거나(마감), 다음 순위로 넘어가거나, 끝났을 때(낙찰 완료·유찰)
        // 로그인한 사람들의 화면이 "내 낙찰 기회"를 다시 확인하도록 신호를 보내요.
        // (누구에게 기회가 갔는지는 담지 않아요. 각 화면이 자기 것만 서버에 다시 물어봐요)
        if (event.affectsOffers()) {
            messagingTemplate.convertAndSend("/topic/offers", message);
        }
    }
}
