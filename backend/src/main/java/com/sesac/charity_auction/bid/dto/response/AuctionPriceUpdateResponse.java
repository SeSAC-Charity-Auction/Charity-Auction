package com.sesac.charity_auction.bid.dto.response;

// 경매 목록
public record AuctionPriceUpdateResponse(
        Long auctionId,
        Long currentPrice,
        Long bidCount
) {
    public static AuctionPriceUpdateResponse from(BidRealtimeResponse response){

        return new AuctionPriceUpdateResponse(
                response.auctionId(),
                response.currentPrice(),
                response.bidCount()
        );
    }
}
