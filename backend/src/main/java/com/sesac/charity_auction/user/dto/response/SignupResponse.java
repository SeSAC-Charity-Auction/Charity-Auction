package com.sesac.charity_auction.user.dto.response;

public record SignupResponse(
        Long id,
        String email,
        String nickname
) {
}
