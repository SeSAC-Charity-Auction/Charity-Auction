package com.sesac.charity_auction.auctioncandidate.controller;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.dto.CandidateAcceptResponseDto;
import com.sesac.charity_auction.auctioncandidate.dto.CandidateRejectResponseDto;
import com.sesac.charity_auction.auctioncandidate.dto.MyOfferedCandidateResponse;
import com.sesac.charity_auction.auctioncandidate.service.AuctionCandidateService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/v1/auction-candidates")
public class AuctionCandidateController {

    private final AuctionCandidateService auctionCandidateService;
    private final CurrentUserProvider currentUser;

    // 낙찰 기회 내역 조건별 조회
    @GetMapping("/my/status")
    public ResponseEntity<List<MyOfferedCandidateResponse>> getMyOfferedCandidate(final @RequestParam AuctionCandidateStatus status) {
        return ResponseEntity.ok(auctionCandidateService.getMyOfferedCandidate(currentUser.currentUserId(), status));
    }

    // 낙찰 기회 내역 전체 조회
    @GetMapping("/my/all")
    public ResponseEntity<List<MyOfferedCandidateResponse>> getAllMyOfferedCandidate() {
        return ResponseEntity.ok(auctionCandidateService.getAllMyOfferedCandidate(currentUser.currentUserId()));
    }

    // 낙찰 수락
    @PostMapping("/{candidateId}/accept")
    public ResponseEntity<CandidateAcceptResponseDto> accept(final @PathVariable Long candidateId) {
        return ResponseEntity.ok(auctionCandidateService.acceptCandidate(currentUser.currentUserId(), candidateId));
    }

    // 낙찰 거절
    @PostMapping("/{candidateId}/reject")
    public ResponseEntity<CandidateRejectResponseDto> reject(final @PathVariable Long candidateId) {
        return ResponseEntity.ok(auctionCandidateService.rejectCandidate(currentUser.currentUserId(), candidateId));
    }
}