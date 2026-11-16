package com.sesac.charity_auction.auth.dto;

public record TokenResponse(
        String tokenType,
        String accessToken,
        long expiresIn
) {
}
