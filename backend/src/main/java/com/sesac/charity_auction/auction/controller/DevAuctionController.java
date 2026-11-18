package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.service.DevAuctionService;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** 개발·테스트 전용 API예요. local 프로필에서만 열려요. (로그인한 사람만 쓸 수 있어요) */
@RestController
@Profile("local")
@RequestMapping("/api/v1/dev/auctions")
@RequiredArgsConstructor
public class DevAuctionController {
    private final DevAuctionService devAuctionService;

    // 진행 중인 경매를 지금 바로 마감해요.
    @PostMapping("/{auctionId}/close")
    public ResponseEntity<Void> closeNow(final @PathVariable long auctionId) {
        devAuctionService.closeNow(auctionId);
        return ResponseEntity.noContent().build();
    }
}
