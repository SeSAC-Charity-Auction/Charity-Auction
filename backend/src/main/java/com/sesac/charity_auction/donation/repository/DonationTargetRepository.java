package com.sesac.charity_auction.donation.repository;

import com.sesac.charity_auction.donation.domain.DonationTarget;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface DonationTargetRepository extends JpaRepository<DonationTarget, Long> {

    List<DonationTarget> findAllByOrderByIdAsc();

    /**
     * 열려 있는 기부처에만 누적액을 더해요.
     *
     * @return 바뀐 행 수. 0이면 마감됐거나 없는 기부처
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update DonationTarget t set t.totalDonation = t.totalDonation + :amount "
            + "where t.id = :targetId and t.active = true")
    int addDonation(@Param("targetId") long targetId, @Param("amount") long amount);
}
