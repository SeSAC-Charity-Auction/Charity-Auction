package com.sesac.charity_auction.auction.repository;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.dto.request.AuctionSearchCondition;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AuctionQueryRepository {
    Page<Auction> searchAuctions(final AuctionSearchCondition condition, final Pageable pageable);
}
