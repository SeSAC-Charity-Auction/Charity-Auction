package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.request.AuctionUpdateRequest;
import com.sesac.charity_auction.auction.dto.response.AuctionDetailResponse;
import com.sesac.charity_auction.auction.service.AuctionManageService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
@Validated
public class AuctionController {

    private final AuctionManageService auctionManageService;
    private final CurrentUserProvider currentUser;

    // 수정
    @PutMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailResponse> updateAuction(@PathVariable Long auctionId, @Valid @RequestBody AuctionUpdateRequest request){

        AuctionDetailResponse response = auctionManageService.updateAuction(auctionId, currentUser.currentUserId(), request);

        return ResponseEntity.ok(response);
    }

    // 삭제

}
