package com.sesac.charity_auction.category.service;

import com.sesac.charity_auction.category.dto.CategoryResponse;
import com.sesac.charity_auction.category.repository.CategoryRepository;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CategoryService {
    private final CategoryRepository categoryRepository;

    public CategoryService(final CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> findAll() {
        return categoryRepository.findAll(Sort.by("id")).stream()
                .map(CategoryResponse::from)
                .toList();
    }
}
