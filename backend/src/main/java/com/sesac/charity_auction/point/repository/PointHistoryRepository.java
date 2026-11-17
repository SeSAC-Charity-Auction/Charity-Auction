package com.sesac.charity_auction.point.repository;

import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.domain.PointType;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
    // 기부 내역(donation)과 기부처 이름을 한 번에 가져와서(left join fetch) 설명 문구를 만들 때 쿼리가 반복되지 않게 해요.
    // 경매 내역처럼 donation이 없는 행도 있어서 left join이에요.
    @Query("select h from PointHistory h "
            + "left join fetch h.donation d left join fetch d.target left join fetch h.auction a left join fetch a.user "
            + "where h.user.id = :userId order by h.createdAt desc, h.id desc")
    List<PointHistory> findRecentByUserId(final @Param("userId") long userId, final Pageable pageable);

    long countByUserId(final long userId);

    // 경매별 적립 내역 확인
    long countByUserIdAndAuctionIdAndPointType(Long userId, Long auctionId, PointType pointType);

    // 포인트 적립 확인용 테스트
    Optional<PointHistory> findFirstByUser_IdAndAuction_IdAndPointType(Long userId, Long auctionId, PointType pointType);

    @Query("select u.id as userId, u.nickname as nickname, u.image as userImage, "
            + "sum(h.pointAmount) as totalDonation, count(h.id) as donationCount "
            + "from PointHistory h join h.user u "
            + "where h.pointType = :pointType and h.donation is not null and u.isDeleted = false "
            + "group by u.id, u.nickname, u.image "
            + "order by sum(h.pointAmount) desc, u.id asc")
    List<DonationRankingProjection> findDonationRanking(final @Param("pointType") PointType pointType);

    // since 이후에 적립된 포인트가 있는지 (상단 메뉴의 붉은 점)
    @Query("select count(h) > 0 from PointHistory h where h.user.id = :userId "
            + "and h.pointType = com.sesac.charity_auction.point.domain.PointType.EARN and h.createdAt > :since")
    boolean existsEarnedAfter(final @Param("userId") long userId, final @Param("since") LocalDateTime since);

    // 경매 낙찰(구매자)로 받은 포인트의 전체 합계: 내가 판매자가 아닌 경매의 적립이에요. (마이페이지 낙찰 이력)
    @Query("select coalesce(sum(h.pointAmount), 0) from PointHistory h where h.user.id = :userId "
            + "and h.pointType = com.sesac.charity_auction.point.domain.PointType.EARN "
            + "and h.auction is not null and h.auction.user.id <> :userId")
    long sumAuctionEarned(final @Param("userId") long userId);

    // 경매 판매(판매자)로 받은 포인트의 전체 합계: 내가 판매자인 경매의 적립이에요. (마이페이지 내가 올린 경매)
    @Query("select coalesce(sum(h.pointAmount), 0) from PointHistory h where h.user.id = :userId "
            + "and h.pointType = com.sesac.charity_auction.point.domain.PointType.EARN "
            + "and h.auction is not null and h.auction.user.id = :userId")
    long sumAuctionSold(final @Param("userId") long userId);

    // 경매별로 받은 포인트: [경매 번호, 합계]
    @Query("select h.auction.id, sum(h.pointAmount) from PointHistory h where h.user.id = :userId "
            + "and h.pointType = com.sesac.charity_auction.point.domain.PointType.EARN "
            + "and h.auction.id in :auctionIds group by h.auction.id")
    List<Object[]> sumEarnedByAuctions(final @Param("userId") long userId,
                                       final @Param("auctionIds") java.util.Collection<Long> auctionIds);
}
