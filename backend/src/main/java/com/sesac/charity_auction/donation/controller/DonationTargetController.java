package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.DonationTargetDetailResponse;
import com.sesac.charity_auction.donation.service.DonationQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/donation-targets")
public class DonationTargetController {

    private final DonationQueryService queryService;

    public DonationTargetController(DonationQueryService queryService) {
        this.queryService = queryService;
    }

    @GetMapping("/{targetId}")
    public DonationTargetDetailResponse detail(@PathVariable long targetId) {
        return queryService.getTargetDetail(targetId);
    }
}
