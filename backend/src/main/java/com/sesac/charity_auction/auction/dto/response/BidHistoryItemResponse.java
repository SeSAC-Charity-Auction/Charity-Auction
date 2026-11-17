package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.global.common.LocalTimes;


/** 경매 상세에 보여줄 입찰 한 건이에요. 입찰자는 닉네임으로만 보여줘요. */
public record BidHistoryItemResponse(long bidId, String nickname, long bidPrice, String bidAt) {
    public static BidHistoryItemResponse from(final Bid bid) {
        return new BidHistoryItemResponse(
                bid.getId(),
                bid.getUser().getNickname(),
                bid.getBidPrice(),
                LocalTimes.toIsoInstant(bid.getBidAt())
        );
    }
}
