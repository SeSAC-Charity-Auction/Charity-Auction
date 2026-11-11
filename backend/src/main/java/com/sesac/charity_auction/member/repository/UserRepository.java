package com.sesac.charity_auction.member.repository;

import com.sesac.charity_auction.member.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, Long> {

    /**
     * 잔액이 충분할 때만 차감해요. 조회와 차감이 한 문장이라, 동시에 여러 번 와도
     * DB가 한 줄씩 처리해서 잔액이 마이너스가 되지 않아요.
     *
     * @return 바뀐 행 수. 0이면 잔액 부족(또는 없는 회원)
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update User u set u.pointBalance = u.pointBalance - :amount "
            + "where u.id = :userId and u.pointBalance >= :amount")
    int deductBalance(@Param("userId") long userId, @Param("amount") long amount);

    @Query("select u.pointBalance from User u where u.id = :userId")
    long findBalanceById(@Param("userId") long userId);
}
