package com.sesac.charity_auction.bid.controller;

import com.sesac.charity_auction.bid.dto.request.BidCreateRequest;
import com.sesac.charity_auction.bid.dto.response.BidCreateResponse;
import com.sesac.charity_auction.bid.service.BidService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/{auctionId}/bids")
@RequiredArgsConstructor
@Validated
public class BidController {

    private final BidService bidService;
    private final CurrentUserProvider currentUser;

    // 입찰 등록
    @PostMapping
    public ResponseEntity<BidCreateResponse> createBid(
            @PathVariable Long auctionId,
            @Valid @RequestBody BidCreateRequest request
            ){
        //
//    BidCreateResponse response = bidService.createBid(auctionId, currentUser.currentUserId(), request);
    BidCreateResponse response = bidService.createBid(auctionId, 10L, request);

    return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
