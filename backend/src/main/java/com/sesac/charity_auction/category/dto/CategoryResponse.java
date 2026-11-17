package com.sesac.charity_auction.category.dto;

import com.sesac.charity_auction.category.domain.Category;

public record CategoryResponse(long categoryId, String categoryName) {
    public static CategoryResponse from(final Category category) {
        return new CategoryResponse(category.getId(), category.getName());
    }
}
