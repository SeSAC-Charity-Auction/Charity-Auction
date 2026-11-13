package com.sesac.charity_auction.auction.repository;

import com.sesac.charity_auction.auction.entity.Auction;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long> {

    // 동시성 고려 - 비관적 락 적용(추후 데이터 변경 예정이므로 락 승격시 발생하는 문제를 방지하기 위해 WRITE 락 적용)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :auctionId AND a.isDeleted = false ")
    Optional<Auction> findByIdWithLock(@Param("auctionId") Long auctionId);

    // DB 시간 기준 통일
    @Query(value = "SELECT CURRENT_TIMESTAMP", nativeQuery = true)
    LocalDateTime findCurrentDatabaseTime();
}
