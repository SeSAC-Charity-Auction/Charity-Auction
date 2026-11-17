package com.sesac.charity_auction.auction.dto.request;

import com.sesac.charity_auction.auction.domain.AuctionSort;
import com.sesac.charity_auction.auction.domain.AuctionStatusFilter;

public record AuctionSearchCondition(
        String keyword,
        AuctionStatusFilter status,
        AuctionSort sort
) {
}
