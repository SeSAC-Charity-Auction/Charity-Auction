package com.sesac.charity_auction.user.dto.response;

public record DuplicateCheckResponse(
        boolean available,
        String message
) {
}
