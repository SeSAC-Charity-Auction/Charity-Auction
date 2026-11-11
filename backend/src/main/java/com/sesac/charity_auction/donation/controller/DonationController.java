package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.DonationRequest;
import com.sesac.charity_auction.donation.dto.DonationResponse;
import com.sesac.charity_auction.donation.dto.DonationSummaryResponse;
import com.sesac.charity_auction.donation.service.DonationQueryService;
import com.sesac.charity_auction.donation.service.DonationService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationQueryService queryService;
    private final DonationService donationService;
    private final CurrentUserProvider currentUser;

    public DonationController(DonationQueryService queryService,
                              DonationService donationService,
                              CurrentUserProvider currentUser) {
        this.queryService = queryService;
        this.donationService = donationService;
        this.currentUser = currentUser;
    }

    @GetMapping("/summary")
    public DonationSummaryResponse summary() {
        return queryService.getSummary();
    }

    @PostMapping
    public DonationResponse donate(@RequestBody DonationRequest request) {
        // 로그인 확인이 먼저예요. 로그인하지 않았으면 여기서 NOT_LOGGED_IN(401)이 나가요.
        long userId = currentUser.currentUserId();
        return donationService.donate(userId, request.targetId(), request.amount());
    }
}
