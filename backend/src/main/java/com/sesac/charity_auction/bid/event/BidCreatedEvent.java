package com.sesac.charity_auction.bid.event;

import com.sesac.charity_auction.bid.dto.response.BidRealtimeResponse;

// 입찰이 성공적으로 저장된 후 발생할 이벤트
public record BidCreatedEvent(Long auctionId, BidRealtimeResponse response) {
}
