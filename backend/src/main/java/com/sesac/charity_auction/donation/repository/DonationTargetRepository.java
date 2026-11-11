package com.sesac.charity_auction.donation.repository;

import com.sesac.charity_auction.donation.domain.DonationTarget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface DonationTargetRepository extends JpaRepository<DonationTarget, Long> {

    List<DonationTarget> findAllByOrderByIdAsc();
}
