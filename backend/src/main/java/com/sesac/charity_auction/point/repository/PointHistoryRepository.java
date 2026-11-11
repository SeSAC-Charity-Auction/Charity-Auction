package com.sesac.charity_auction.point.repository;

import com.sesac.charity_auction.point.domain.PointHistory;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {
}
