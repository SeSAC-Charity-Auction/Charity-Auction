package com.sesac.charity_auction.point.repository;

import com.sesac.charity_auction.point.domain.PointHistory;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface PointHistoryRepository extends JpaRepository<PointHistory, Long> {

    // 기부 내역(donation)과 기부처 이름을 한 번에 가져와서(left join fetch) 설명 문구를 만들 때 쿼리가 반복되지 않게 해요.
    // 경매 내역처럼 donation이 없는 행도 있어서 left join이에요.
    @Query("select h from PointHistory h "
            + "left join fetch h.donation d left join fetch d.target "
            + "where h.user.id = :userId order by h.createdAt desc, h.id desc")
    List<PointHistory> findRecentByUserId(@Param("userId") long userId, Pageable pageable);
}
