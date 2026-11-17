package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.response.AuctionDetailResponse;
import com.sesac.charity_auction.auction.dto.response.AuctionPageResponse;
import com.sesac.charity_auction.auction.service.AuctionImageService;
import com.sesac.charity_auction.auction.service.AuctionQueryService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auctions")
public class AuctionController {
    private final AuctionQueryService queryService;
    private final AuctionImageService imageService;
    private final CurrentUserProvider currentUser;

    public AuctionController(final AuctionQueryService queryService,
                             final AuctionImageService imageService,
                             final CurrentUserProvider currentUser) {
        this.queryService = queryService;
        this.imageService = imageService;
        this.currentUser = currentUser;
    }

    // 경매 물품 목록 (메인 페이지). 로그인 없이 볼 수 있어요.
    @GetMapping
    public AuctionPageResponse list(final @RequestParam(required = false) String status,
                                    final @RequestParam(required = false) Long categoryId,
                                    final @RequestParam(required = false) String keyword,
                                    final @RequestParam(defaultValue = "ending") String sort,
                                    final @RequestParam(defaultValue = "0") int page,
                                    final @RequestParam(defaultValue = "12") int size) {
        return queryService.search(status, categoryId, keyword, sort, page, size);
    }

    // 경매 물품 상세. 로그인 없이 볼 수 있어요. 없는 경매는 404예요.
    @GetMapping("/{auctionId}")
    public AuctionDetailResponse detail(final @PathVariable long auctionId) {
        return queryService.getDetail(auctionId);
    }

    // POST /api/v1/auctions/{auctionId}/image : 판매자가 경매 물품 이미지를 바꿔요. 성공하면 { image }
    @PostMapping("/{auctionId}/image")
    public Map<String, String> uploadImage(final @PathVariable long auctionId,
                                           final @RequestParam("file") MultipartFile file) {
        return Map.of("image", imageService.upload(currentUser.currentUserId(), auctionId, file));
    }
}
