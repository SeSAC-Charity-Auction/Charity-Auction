package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.request.AuctionSearchCondition;
import com.sesac.charity_auction.auction.dto.request.AuctionUpdateRequest;
import com.sesac.charity_auction.auction.dto.response.AuctionDetailResponse;
import com.sesac.charity_auction.auction.dto.response.AuctionListResponse;
import com.sesac.charity_auction.auction.service.AuctionManageService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
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

    // 경매 목록 조회 및 검색, 필터링
    @GetMapping
    public ResponseEntity<Page<AuctionListResponse>> getAuctions(@ModelAttribute AuctionSearchCondition condition, @PageableDefault(size = 10) Pageable pageable){

        Page<AuctionListResponse> response = auctionManageService.getAuctions(condition, pageable);

        return ResponseEntity.ok(response);
    }

    // 경매 상세 조회
    @GetMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailResponse> getAuctionDetail(@PathVariable Long auctionId){

        AuctionDetailResponse response = auctionManageService.getAuctionDetail(auctionId);

        return ResponseEntity.ok(response);
    }

    // 수정
    @PutMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailResponse> updateAuction(@PathVariable Long auctionId, @Valid @RequestBody AuctionUpdateRequest request){

        AuctionDetailResponse response = auctionManageService.updateAuction(auctionId, currentUser.currentUserId(), request);

        return ResponseEntity.ok(response);
    }

    // 삭제
    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long auctionId){

        auctionManageService.deleteAuction(auctionId, currentUser.currentUserId());

        return ResponseEntity.noContent().build();
    }
}
