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
     * 열려 있고 아직 목표를 채우지 못한 기부처에만, 더한 결과가 목표 금액을 넘지 않을 때에 한해 누적액을 더하고, 목표 금액에 닿으면 달성 여부(is_achieved)를 true로 바꿔요.
     *
     * @return 바뀐 행 수. 0이면 마감됐거나, 목표를 이미 채웠거나, 없는 기부처이거나, 이 금액을 더하면 목표를 넘는 경우
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update DonationTarget t set t.totalDonation = t.totalDonation + :amount, "
            + "t.achieved = case when t.totalDonation + :amount >= t.targetAmount then true else t.achieved end "
            + "where t.id = :targetId and t.active = true and t.achieved = false "
            + "and t.totalDonation + :amount <= t.targetAmount")
    int addDonation(final @Param("targetId") long targetId, final @Param("amount") long amount);
}
