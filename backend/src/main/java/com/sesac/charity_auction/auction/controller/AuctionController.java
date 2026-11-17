package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.dto.response.AuctionPageResponse;
import com.sesac.charity_auction.auction.service.AuctionQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/auctions")
public class AuctionController {
    private final AuctionQueryService queryService;

    public AuctionController(final AuctionQueryService queryService) {
        this.queryService = queryService;
    }

    // 경매 물품 목록 (메인 페이지). 로그인 없이 볼 수 있어요.
    @GetMapping
    public AuctionPageResponse list(final @RequestParam(required = false) AuctionStatus status,
                                    final @RequestParam(required = false) Long categoryId,
                                    final @RequestParam(required = false) String keyword,
                                    final @RequestParam(defaultValue = "ending") String sort,
                                    final @RequestParam(defaultValue = "0") int page,
                                    final @RequestParam(defaultValue = "12") int size) {
        return queryService.search(status, categoryId, keyword, sort, page, size);
    }
}
