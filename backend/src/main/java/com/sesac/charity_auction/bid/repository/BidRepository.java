package com.sesac.charity_auction.bid.repository;

import com.sesac.charity_auction.bid.entity.Bid;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BidRepository extends JpaRepository<Bid, Long> {
    void deleteAllByAuction_Id(Long auctionId);
}
