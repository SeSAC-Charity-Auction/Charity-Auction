package com.sesac.charity_auction.auth.dto;

public record AuthTokens(
        TokenResponse tokenResponse,
        String refreshToken
) {
}
