package com.sesac.charity_auction.donation.repository;

import com.sesac.charity_auction.donation.domain.Donation;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationRepository extends JpaRepository<Donation, Long> {
    @Query("select coalesce(sum(d.donationAmount), 0) from Donation d")
    long sumAmount();

    @Query("select count(distinct d.user.id) from Donation d")
    long countDistinctDonors();

    long countByTargetId(final Long targetId);

    // 마이페이지: 내가 한 기부의 횟수와 총액
    long countByUserId(final Long userId);

    @Query("select coalesce(sum(d.donationAmount), 0) from Donation d where d.user.id = :userId")
    long sumAmountByUserId(final @Param("userId") long userId);

    @Query("select count(distinct d.user.id) from Donation d where d.target.id = :targetId")
    long countDistinctDonorsByTargetId(final @Param("targetId") Long targetId);

    // fetch join: 기부처와 회원을 한 번의 쿼리로 같이 가져와서, 목록을 만들 때 쿼리가 반복되는 걸 막아요.
    @Query("select d from Donation d join fetch d.target join fetch d.user "
            + "order by d.createdAt desc, d.id desc")
    List<Donation> findRecent(final Pageable pageable);

    @Query("select d from Donation d join fetch d.target join fetch d.user "
            + "where d.target.id = :targetId order by d.createdAt desc, d.id desc")
    List<Donation> findRecentByTargetId(final @Param("targetId") Long targetId, final Pageable pageable);
}
