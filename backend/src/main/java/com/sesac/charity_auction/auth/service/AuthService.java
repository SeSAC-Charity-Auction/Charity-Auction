package com.sesac.charity_auction.auth.service;

import com.sesac.charity_auction.auth.dto.AuthTokens;
import com.sesac.charity_auction.auth.dto.LoginRequest;
import com.sesac.charity_auction.auth.dto.TokenResponse;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(final AuthenticationManager authenticationManager,
                       final JwtService jwtService,
                       final RefreshTokenService refreshTokenService) {
        this.authenticationManager = authenticationManager;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public AuthTokens login(final LoginRequest request) {
        final Authentication authentication = authenticationManager.authenticate(
                UsernamePasswordAuthenticationToken.unauthenticated(request.email(), request.password())
        );

        final String accessToken = jwtService.createAccessToken(authentication);
        final String refreshToken = refreshTokenService.issue(Long.parseLong(authentication.getName()));

        return new AuthTokens(createTokenResponse(accessToken), refreshToken);
    }

    public AuthTokens refresh(final String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            throw new BusinessException(ErrorCode.INVALID_REFRESH_TOKEN, "Refresh Token이 필요해요.");
        }
        final RefreshTokenService.Rotation rotation = refreshTokenService.rotate(refreshToken);

        final String accessToken = jwtService.createAccessToken(rotation.userId(), rotation.role());
        return new AuthTokens(createTokenResponse(accessToken), rotation.refreshToken());
    }

    public void logout(final String refreshToken) {
        if (refreshToken != null && !refreshToken.isBlank()) {
            refreshTokenService.revoke(refreshToken);
        }
    }

    private TokenResponse createTokenResponse(final String accessToken) {
        return new TokenResponse("Bearer", accessToken, jwtService.getExpirationSeconds());
    }
}
