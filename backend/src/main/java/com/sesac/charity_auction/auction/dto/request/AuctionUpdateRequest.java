package com.sesac.charity_auction.auction.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record AuctionUpdateRequest(
        @NotBlank(message = "경매 제목은 필수입니다.")
        @Size(max = 100, message = "경매 제목은 100자 이하여야 합니다.")
        String title,

        String description,

        @NotNull(message = "카테고리는 필수입니다.")
        @Positive(message = "올바른 카테고리 ID를 입력해주세요.")
        Long categoryId,

        @NotNull(message = "시작 가격은 필수입니다.")
        @Positive(message = "시작 가격은 0보다 커야 합니다.")
        Long startPrice,

        @NotNull(message = "경매 시작 시간은 필수입니다.")
        LocalDateTime startAt,

        @NotNull(message = "경매 마감 시간은 필수입니다.")
        LocalDateTime endAt
) {
}
