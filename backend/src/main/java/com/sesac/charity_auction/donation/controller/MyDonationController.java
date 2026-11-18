package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.MyDonationPageResponse;
import com.sesac.charity_auction.donation.service.MyDonationQueryService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/** 내 기부 이력이에요. 로그인이 필요해요. (로그인하지 않았으면 NOT_LOGGED_IN 401) */
@RestController
@RequestMapping("/api/me")
public class MyDonationController {
    private final MyDonationQueryService queryService;
    private final CurrentUserProvider currentUser;

    public MyDonationController(final MyDonationQueryService queryService, final CurrentUserProvider currentUser) {
        this.queryService = queryService;
        this.currentUser = currentUser;
    }

    @GetMapping("/donations")
    public MyDonationPageResponse myDonations(final @RequestParam(defaultValue = "0") int page,
                                              final @RequestParam(defaultValue = "10") int size) {
        return queryService.getMyDonations(currentUser.currentUserId(), page, size);
    }
}
