package com.sesac.charity_auction.auction.repository;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.dto.response.AuctionListResponse;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    // 동시성 고려 - 비관적 락 적용(추후 데이터 변경 예정이므로 락 승격시 발생하는 문제를 방지하기 위해 WRITE 락 적용)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :auctionId AND a.isDeleted = false ")
    Optional<Auction> findByIdWithLock(@Param("auctionId") Long auctionId);

    // DB 시간 기준 통일
    @Query(value = "SELECT CURRENT_TIMESTAMP", nativeQuery = true)
    LocalDateTime findCurrentDatabaseTime();

    // 만료된 경매
    @Query("SELECT a.id FROM Auction a WHERE a.status = :status AND a.endAt <= :now AND a.isDeleted = false")
    List<Long> findExpiredAuctionIds(@Param("status")AuctionStatus status, @Param("now") LocalDateTime now);

    @Query("""
    SELECT new com.sesac.charity_auction.auction.dto.response.AuctionListResponse(a.id, a.title, c.bidPrice)
    FROM Auction a
    LEFT JOIN AuctionCandidate c
        ON c.auction.id = a.id
        AND c.status = :status
    """)
    List<AuctionListResponse> findAuctionList(@Param("status")AuctionCandidateStatus status);

    // 경매 조회
    Optional<Auction> findByIdAndIsDeletedFalse(Long id);
}
