package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.DonationSummaryResponse;
import com.sesac.charity_auction.donation.service.DonationQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donations")
public class DonationController {

    private final DonationQueryService queryService;

    public DonationController(DonationQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/summary")
    public DonationSummaryResponse summary() {
        return queryService.getSummary();
    }

    // POST /api/donations (기부하기)는 6단계에서 이 컨트롤러에 추가해요.
}
