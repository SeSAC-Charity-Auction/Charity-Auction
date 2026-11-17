package com.sesac.charity_auction.auctioncandidate.repository;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
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

    @Query("SELECT DISTINCT c.auction.id FROM AuctionCandidate c WHERE c.status = :candidateStatus AND c.deadlineAt <= :now AND c.auction.status = :auctionStatus AND c.auction.isDeleted = false ")
    List<Long> findExpiredCandidateAuctionIds(@Param("candidateStatus") AuctionCandidateStatus status,
                                              @Param("auctionStatus") AuctionStatus auctionStatus,
                                              @Param("now")LocalDateTime now);

    // 낙찰 내역 상태 조건별 조회
    @EntityGraph(attributePaths = {"auction"}) // 엔티티는 계속 LAZY 상태로 유지하지만, 해당 조회에서만 Auction을 함께 가져오도록
    List<AuctionCandidate> findAllByUser_IdAndStatusOrderByIdDesc(Long userId, AuctionCandidateStatus status);

    // 낙찰 내역 전체 조회 (최신순)
    @EntityGraph(attributePaths = {"auction"}) // 엔티티는 계속 LAZY 상태로 유지하지만, 해당 조회에서만 Auction을 함께 가져오도록
    List<AuctionCandidate> findAllByUser_IdOrderByIdDesc(Long userId);

    // 비관적 락 적용 후보자 조회
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT c FROM AuctionCandidate c WHERE c.id = :candidateId")
    Optional<AuctionCandidate> findByIdWithLock(@Param("candidateId") Long candidateId);

    // 후보자의 경매 ID 조회
    @Query("SELECT c.auction.id FROM AuctionCandidate c WHERE c.id = :candidateId")
    Optional<Long> findAuctionIdByCandidateId(@Param("candidateId") Long candidateId);

    // 특정 경매에서 특정 상태의 후보들 조회
    List<AuctionCandidate> findAllByAuction_IdAndStatus(Long auctionId, AuctionCandidateStatus status);

    // 경매별 낙찰 후보 전체 조회 (순위순)
    List<AuctionCandidate> findAllByAuction_IdOrderByRankAsc(Long auctionId);

    // 마이페이지: 내가 낙찰받은 경매 (낙찰 확정이 최근인 순)
    @Query(value = """
            SELECT c FROM AuctionCandidate c JOIN FETCH c.auction a JOIN FETCH a.category
            WHERE c.user.id = :userId AND c.status = :status
            ORDER BY c.processedAt DESC, c.id DESC
            """,
            countQuery = "SELECT COUNT(c) FROM AuctionCandidate c WHERE c.user.id = :userId AND c.status = :status")
    org.springframework.data.domain.Page<AuctionCandidate> findMyResults(
            @Param("userId") Long userId,
            @Param("status") AuctionCandidateStatus status,
            org.springframework.data.domain.Pageable pageable);
}
