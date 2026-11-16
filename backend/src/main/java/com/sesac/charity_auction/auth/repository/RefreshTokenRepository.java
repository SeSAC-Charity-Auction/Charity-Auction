package com.sesac.charity_auction.auth.repository;

import com.sesac.charity_auction.auth.domain.RefreshToken;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByTokenHash(final String tokenHash);

    Optional<RefreshToken> findByUser_Id(final Long userId);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query(value = "INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES (:userId, :tokenHash, :expiresAt) AS new "
            + "ON DUPLICATE KEY UPDATE token_hash = new.token_hash, expires_at = new.expires_at", nativeQuery = true)
    int upsert(final @Param("userId") long userId,
               final @Param("tokenHash") String tokenHash,
               final @Param("expiresAt") LocalDateTime expiresAt);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("update RefreshToken t set t.tokenHash = :newHash, t.expiresAt = :expiresAt "
            + "where t.id = :id and t.tokenHash = :oldHash")
    int rotateIfUnchanged(final @Param("id") long id,
                          final @Param("oldHash") String oldHash,
                          final @Param("newHash") String newHash,
                          final @Param("expiresAt") LocalDateTime expiresAt);

    @Modifying(flushAutomatically = true, clearAutomatically = true)
    @Query("delete from RefreshToken t where t.user.id = :userId")
    int deleteByUserId(final @Param("userId") long userId);
}
