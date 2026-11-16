package com.sesac.charity_auction.user.repository;

import com.sesac.charity_auction.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(final String email);
    boolean existsByEmail(final String email);

    boolean existsByNicknameAndIsDeletedFalse(final String nickname);

    boolean existsByNicknameAndIsDeletedFalseAndIdNot(final String nickname, final Long id);

    /**
     * 잔액이 충분할 때만 차감해요. 조회와 차감이 한 문장이라, 동시에 여러 번 와도
     * DB가 한 줄씩 처리해서 잔액이 마이너스가 되지 않아요.
     *
     * @return 바뀐 행 수. 0이면 잔액 부족(또는 없는 회원, 탈퇴한 회원)
     */
    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update User u set u.pointBalance = u.pointBalance - :amount "
            + "where u.id = :userId and u.isDeleted = false and u.pointBalance >= :amount")
    int deductBalance(final @Param("userId") long userId, final @Param("amount") long amount);

    @Query("select u.pointBalance from User u where u.id = :userId")
    long findBalanceById(final @Param("userId") long userId);
}
