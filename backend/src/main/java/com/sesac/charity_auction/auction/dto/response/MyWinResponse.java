package com.sesac.charity_auction.auction.dto.response;

/** 내가 낙찰받은 경매 한 건과, 그 낙찰로 받은 포인트예요. 시간은 UTC 표시가 있는 ISO 8601이에요. */
public record MyWinResponse(
        long auctionId,
        String title,
        String image,
        String categoryName,
        long bidPrice,     // 낙찰가
        String wonAt,      // 낙찰이 확정된 시각
        long pointAmount   // 이 낙찰로 받은 포인트 (point_histories의 적립 합계)
) {
}
