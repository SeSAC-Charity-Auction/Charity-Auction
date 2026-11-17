package com.sesac.charity_auction.category.repository;

import com.sesac.charity_auction.category.domain.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
