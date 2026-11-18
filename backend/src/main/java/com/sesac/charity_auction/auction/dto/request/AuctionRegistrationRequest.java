package com.sesac.charity_auction.auction.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;

public record AuctionRegistrationRequest(
        @NotBlank @Size(max = 100) String title,
        String description,
        @NotNull @Positive Long categoryId,
        @NotNull @Min(1000) Long startPrice,
        LocalDateTime startAt,
        LocalDateTime endAt
) {
    public AuctionRegistrationRequest(final String title, final String description,
                                      final Long categoryId, final Long startPrice) {
        this(title, description, categoryId, startPrice, null, null);
    }
}
