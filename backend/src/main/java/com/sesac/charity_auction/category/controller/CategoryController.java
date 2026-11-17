package com.sesac.charity_auction.category.controller;

import com.sesac.charity_auction.category.dto.CategoryResponse;
import com.sesac.charity_auction.category.service.CategoryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/categories")
public class CategoryController {
    private final CategoryService categoryService;

    public CategoryController(final CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public List<CategoryResponse> list() {
        return categoryService.findAll();
    }
}
