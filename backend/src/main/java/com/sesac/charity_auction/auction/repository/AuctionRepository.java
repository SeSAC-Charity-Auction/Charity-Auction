package com.sesac.charity_auction.auction.repository;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import jakarta.persistence.LockModeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface AuctionRepository extends JpaRepository<Auction, Long>, AuctionQueryRepository {

    // 동시성 고려 - 비관적 락 적용(추후 데이터 변경 예정이므로 락 승격시 발생하는 문제를 방지하기 위해 WRITE 락 적용)
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT a FROM Auction a WHERE a.id = :auctionId AND a.isDeleted = false ")
    Optional<Auction> findByIdWithLock(final @Param("auctionId") Long auctionId);

    // DB 시간 기준 통일
    @Query(value = "SELECT CURRENT_TIMESTAMP", nativeQuery = true)
    LocalDateTime findCurrentDatabaseTime();

    // 만료된 경매
    @Query("SELECT a.id FROM Auction a WHERE a.status = :status AND a.endAt <= :now AND a.isDeleted = false")
    List<Long> findExpiredAuctionIds(final @Param("status") AuctionStatus status, final @Param("now") LocalDateTime now);


//    @Query("""
//    SELECT new com.sesac.charity_auction.auction.dto.response.AuctionListResponse(a.id, a.title, c.bidPrice)
//    FROM Auction a
//    LEFT JOIN AuctionCandidate c
//        ON c.auction.id = a.id
//        AND c.status = :status
//    """)
//    List<AuctionListResponse> findAuctionList(@Param("status")AuctionCandidateStatus status);

    // 경매 조회
    Optional<Auction> findByIdAndIsDeletedFalse(final Long id);


    // 경매 물품 목록: 삭제·취소되지 않은 경매를 보기 방식·카테고리·검색어로 걸러요. (null이면 그 조건은 쓰지 않아요)
    //  mode: ALL(전부) / IN_PROGRESS(지금 입찰할 수 있는 경매) / SCHEDULED(예정) / ENDED(마감)
    //  "마감"에는 이미 마감 처리된 경매(CLOSED·COMPLETED·FAILED)와, 마감 시각이 지났지만
    //  아직 스케줄러가 처리하지 못한 진행 중 경매가 함께 들어가요.
    //  진행 중·예정 경매를 먼저, 마감된 경매는 뒤에 두고, 그 안에서는 Pageable의 정렬을 따라요.
    // 카테고리를 fetch join해서 목록을 만들 때 쿼리가 반복되지 않게 해요.
    @Query(value = """
            SELECT a FROM Auction a JOIN FETCH a.category c
            WHERE a.isDeleted = false
              AND a.status <> com.sesac.charity_auction.auction.domain.AuctionStatus.CANCELED
              AND (:mode = 'ALL'
                   OR (:mode = 'IN_PROGRESS'
                       AND a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.IN_PROGRESS
                       AND a.endAt > :now)
                   OR (:mode = 'SCHEDULED'
                       AND a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.SCHEDULED)
                   OR (:mode = 'ENDED'
                       AND (a.status IN (com.sesac.charity_auction.auction.domain.AuctionStatus.CLOSED,
                                         com.sesac.charity_auction.auction.domain.AuctionStatus.COMPLETED,
                                         com.sesac.charity_auction.auction.domain.AuctionStatus.FAILED)
                            OR (a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.IN_PROGRESS
                                AND a.endAt <= :now))))
              AND (:categoryId IS NULL OR c.id = :categoryId)
              AND (:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
            ORDER BY CASE WHEN (a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.SCHEDULED
                                OR (a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.IN_PROGRESS
                                    AND a.endAt > :now)) THEN 0 ELSE 1 END
            """,
            countQuery = """
                    SELECT COUNT(a) FROM Auction a
                    WHERE a.isDeleted = false
                      AND a.status <> com.sesac.charity_auction.auction.domain.AuctionStatus.CANCELED
                      AND (:mode = 'ALL'
                           OR (:mode = 'IN_PROGRESS'
                               AND a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.IN_PROGRESS
                               AND a.endAt > :now)
                           OR (:mode = 'SCHEDULED'
                               AND a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.SCHEDULED)
                           OR (:mode = 'ENDED'
                               AND (a.status IN (com.sesac.charity_auction.auction.domain.AuctionStatus.CLOSED,
                                                 com.sesac.charity_auction.auction.domain.AuctionStatus.COMPLETED,
                                                 com.sesac.charity_auction.auction.domain.AuctionStatus.FAILED)
                                    OR (a.status = com.sesac.charity_auction.auction.domain.AuctionStatus.IN_PROGRESS
                                        AND a.endAt <= :now))))
                      AND (:categoryId IS NULL OR a.category.id = :categoryId)
                      AND (:keyword IS NULL OR LOWER(a.title) LIKE LOWER(CONCAT('%', :keyword, '%')))
                    """)
    Page<Auction> search(final @Param("mode") String mode,
                         final @Param("now") LocalDateTime now,
                         final @Param("categoryId") Long categoryId,
                         final @Param("keyword") String keyword,
                         final Pageable pageable);

    // 상세 화면용: 카테고리와 판매자를 한 번에 가져와요. 삭제된 경매는 없는 것으로 봐요.
    @Query("""
            SELECT a FROM Auction a JOIN FETCH a.category JOIN FETCH a.user
            WHERE a.id = :auctionId AND a.isDeleted = false
            """)
    Optional<Auction> findDetailById(final @Param("auctionId") Long auctionId);

    // 마이페이지: 내가 올린 경매 (최신 등록순). 삭제한 경매는 빼요.
    @Query(value = """
            SELECT a FROM Auction a JOIN FETCH a.category
            WHERE a.user.id = :userId AND a.isDeleted = false
            ORDER BY a.createdAt DESC, a.id DESC
            """,
            countQuery = "SELECT COUNT(a) FROM Auction a WHERE a.user.id = :userId AND a.isDeleted = false")
    Page<Auction> findMine(final @Param("userId") Long userId, final Pageable pageable);
}
