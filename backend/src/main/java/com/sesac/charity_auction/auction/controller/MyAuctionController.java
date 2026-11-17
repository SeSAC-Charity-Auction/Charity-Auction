package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.response.MyAuctionPageResponse;
import com.sesac.charity_auction.auction.dto.response.MyWinPageResponse;
import com.sesac.charity_auction.auction.service.MyAuctionQueryService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 마이페이지의 경매 관련 조회예요. 모두 로그인이 필요해요. (로그인하지 않았으면 NOT_LOGGED_IN 401) */
@RestController
@RequestMapping("/api/v1/me")
public class MyAuctionController {
    private final MyAuctionQueryService queryService;
    private final CurrentUserProvider currentUser;

    public MyAuctionController(final MyAuctionQueryService queryService, final CurrentUserProvider currentUser) {
        this.queryService = queryService;
        this.currentUser = currentUser;
    }

    // 내가 올린 경매
    @GetMapping("/auctions")
    public MyAuctionPageResponse myAuctions(final @RequestParam(defaultValue = "0") int page,
                                          final @RequestParam(defaultValue = "10") int size) {
        return queryService.getMyAuctions(currentUser.currentUserId(), page, size);
    }

    // 내 낙찰 이력과 그 낙찰로 받은 포인트
    @GetMapping("/wins")
    public MyWinPageResponse myWins(final @RequestParam(defaultValue = "0") int page,
                                    final @RequestParam(defaultValue = "10") int size) {
        return queryService.getMyWins(currentUser.currentUserId(), page, size);
    }
}
