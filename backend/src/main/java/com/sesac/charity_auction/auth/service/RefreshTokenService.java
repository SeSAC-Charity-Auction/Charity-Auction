package com.sesac.charity_auction.auth.service;

import com.sesac.charity_auction.auth.domain.RefreshToken;
import com.sesac.charity_auction.auth.repository.RefreshTokenRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.domain.Role;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.time.temporal.ChronoUnit;
import java.util.Base64;
import java.util.HexFormat;

@Service
@Transactional(readOnly = true)
public class RefreshTokenService {
    private static final int TOKEN_BYTE_LENGTH = 32;

    private final RefreshTokenRepository refreshTokenRepository;
    private final UserRepository userRepository;
    private final long expirationSeconds;
    private final SecureRandom secureRandom = new SecureRandom();

    public RefreshTokenService(final RefreshTokenRepository refreshTokenRepository,
                               final UserRepository userRepository,
                               @Value("${security.refresh-token.expiration-seconds}") final long expirationSeconds) {
        this.refreshTokenRepository = refreshTokenRepository;
        this.userRepository = userRepository;
        this.expirationSeconds = expirationSeconds;
    }

    @Transactional
    public String issue(final long userId) {
        final boolean activeUser = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .isPresent();
        if (!activeUser) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "Refresh Token을 발급할 회원을 찾을 수 없어요.");
        }

        final String rawToken = createRawToken();
        refreshTokenRepository.upsert(userId, hash(rawToken), now().plusSeconds(expirationSeconds));
        return rawToken;
    }

    @Transactional
    public Rotation rotate(final String rawToken) {
        final String oldHash = hash(rawToken);
        final RefreshToken savedToken = findValidToken(oldHash);
        final User user = savedToken.getUser();
        final long userId = user.getId();
        final Role role = user.getRole();

        final String newRawToken = createRawToken();
        final int changed = refreshTokenRepository.rotateIfUnchanged(
                savedToken.getId(), oldHash, hash(newRawToken), now().plusSeconds(expirationSeconds));
        if (changed == 0) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "유효하지 않은 Refresh Token이에요.");
        }
        return new Rotation(userId, role, newRawToken);
    }

    @Transactional
    public void revoke(final String rawToken) {
        refreshTokenRepository.findByTokenHash(hash(rawToken))
                .ifPresent(refreshTokenRepository::delete);
    }

    @Transactional
    public void revokeAll(final long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }

    private RefreshToken findValidToken(final String tokenHash) {
        final RefreshToken savedToken = refreshTokenRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "유효하지 않은 Refresh Token이에요."));

        if (savedToken.isExpired(now())) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "만료된 Refresh Token이에요.");
        }
        if (savedToken.getUser().isDeleted()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "사용할 수 없는 계정이에요.");
        }
        return savedToken;
    }

    private String createRawToken() {
        final byte[] bytes = new byte[TOKEN_BYTE_LENGTH];
        secureRandom.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private static String hash(final String rawToken) {
        try {
            final MessageDigest digest = MessageDigest.getInstance("SHA-256");
            final byte[] hashed = digest.digest(rawToken.getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hashed);
        } catch (final NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 알고리즘을 쓸 수 없어요.", exception);
        }
    }

    private static LocalDateTime now() {
        return LocalDateTime.now(ZoneOffset.UTC).truncatedTo(ChronoUnit.SECONDS);
    }

    public record Rotation(
            long userId,
            Role role,
            String refreshToken
    ) {
    }
}
