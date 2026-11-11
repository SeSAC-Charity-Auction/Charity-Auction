package com.sesac.charity_auction.user.repository;

import com.sesac.charity_auction.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    boolean existsByEmailAndIsDeletedFalse(String email);

    boolean existsByNicknameAndIsDeletedFalse(String nickname);
}
