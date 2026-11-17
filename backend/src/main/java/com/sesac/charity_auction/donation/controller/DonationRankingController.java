package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.DonationRankingResponse;
import com.sesac.charity_auction.donation.service.DonationRankingService;
import io.swagger.v3.oas.annotations.Operation;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/donations")
public class DonationRankingController {
    private final DonationRankingService donationRankingService;

    public DonationRankingController(DonationRankingService donationRankingService) {
        this.donationRankingService = donationRankingService;
    }

    @Operation(summary = "누적 기부 랭킹 조회", description = "기부용 USE 포인트 합계로 정렬하며 동점은 1, 2, 2, 4위로 처리합니다.")
    @GetMapping("/ranking")
    public List<DonationRankingResponse> ranking() {
        return donationRankingService.getRanking();
    }
}
