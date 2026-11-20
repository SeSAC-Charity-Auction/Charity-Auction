package com.sesac.charity_auction.bid.repository;

import com.sesac.charity_auction.auctioncandidate.dto.HighestBidDto;
import com.sesac.charity_auction.bid.entity.Bid;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {
    void deleteAllByAuction_Id(final Long auctionId);

    List<Bid> findTop5ByAuction_IdOrderByBidAtDesc(final Long auctionId);

    // 경매 상세의 입찰 내역: 입찰자를 한 번에 가져와서 N+1 문제 방지
    @EntityGraph(attributePaths = {"user"})
    List<Bid> findTop10ByAuction_IdOrderByBidAtDescIdDesc(final Long auctionId);

    // 유저의 최고 입찰 금액을 낙찰 후보 데이터로 가지고 오기
    @Query(value = """
                SELECT
                    ranked.user_id AS userId,
                    ranked.bid_id AS bidId,
                    ranked.bid_price AS bidPrice
                FROM (
                    SELECT
                        b.user_id, b.bid_id, b.bid_price,
                            ROW_NUMBER() OVER (
                                PARTITION BY b.user_id
                                ORDER BY b.bid_price DESC, b.bid_id ASC
                            ) AS user_rank
                    FROM bids b
                    WHERE b.auction_id = :auctionId
                    ) ranked
                    WHERE ranked.user_rank = 1
                    ORDER BY ranked.bid_price DESC, ranked.bid_id ASC
            """, nativeQuery = true)
    List<HighestBidDto> findHighestBidsByUser(final @Param("auctionId") Long auctionId);
}
