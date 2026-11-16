package com.sesac.charity_auction.auctioncandidate.controller;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.dto.MyOfferedCandidateResponse;
import com.sesac.charity_auction.auctioncandidate.service.AuctionCandidateService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auction-candidates")
public class AuctionCandidateController {

    private final AuctionCandidateService auctionCandidateService;
    private final CurrentUserProvider currentUser;

    // 낙찰 기회 내역 조건별 조회
    @GetMapping("/my/status")
    public ResponseEntity<List<MyOfferedCandidateResponse>> getMyOfferedCandidate(@RequestParam AuctionCandidateStatus status){

        return ResponseEntity.ok(auctionCandidateService.getMyOfferedCandidate(1L, status));
    }

    // 낙찰 기회 내역 전체 조회
    @GetMapping("/my/all")
    public ResponseEntity<List<MyOfferedCandidateResponse>> getAllMyOfferedCandidate(){

        return ResponseEntity.ok(auctionCandidateService.getAllMyOfferedCandidate(1L));
    }
}
