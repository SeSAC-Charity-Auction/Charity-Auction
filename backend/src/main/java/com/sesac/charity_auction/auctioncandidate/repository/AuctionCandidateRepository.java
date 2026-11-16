package com.sesac.charity_auction.auctioncandidate.repository;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface AuctionCandidateRepository extends JpaRepository<AuctionCandidate, Long> {

    Optional<AuctionCandidate> findFirstByAuctionIdAndStatusOrderByRankAsc(Long auctionId, AuctionCandidateStatus status);

    Optional<AuctionCandidate> findByAuction_IdAndStatus(Long auctionId, AuctionCandidateStatus status);

    @Query("SELECT c.auction.id FROM AuctionCandidate c WHERE c.status = :candidateStatus AND c.deadlineAt <= :now AND c.auction.status = :auctionStatus AND c.auction.isDeleted = false ")
    List<Long> findExpiredCandidateAuctionIds(@Param("candidateStatus") AuctionCandidateStatus status,
                                              @Param("auctionStatus") AuctionStatus auctionStatus,
                                              @Param("now")LocalDateTime now);

    // 낙찰 내역 상태 조건별 조회
    List<AuctionCandidate> findAllByUser_IdAndStatusOrderByIdDesc(Long userId, AuctionCandidateStatus status);

    // 낙찰 내역 전체 조회 (최신순)
    List<AuctionCandidate> findAllByUser_IdOrderByIdDesc(Long userId);
}
