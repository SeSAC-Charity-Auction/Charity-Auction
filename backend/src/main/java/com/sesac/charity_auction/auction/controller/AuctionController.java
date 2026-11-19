package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.request.AuctionRegistrationRequest;
import com.sesac.charity_auction.auction.dto.request.AuctionSearchCondition;
import com.sesac.charity_auction.auction.dto.request.AuctionUpdateRequest;
import com.sesac.charity_auction.auction.dto.response.*;
import com.sesac.charity_auction.auction.service.AuctionImageService;
import com.sesac.charity_auction.auction.service.AuctionManageService;
import com.sesac.charity_auction.auction.service.AuctionQueryService;
import com.sesac.charity_auction.auction.service.AuctionRegistrationService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
@Validated
public class AuctionController {

    private final AuctionManageService auctionManageService;
    private final AuctionImageService imageService;
    private final AuctionQueryService queryService;
    private final CurrentUserProvider currentUser;
    private final AuctionRegistrationService registrationService;

    // 경매 등록
    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuctionRegistrationResponse> register(
            final @Valid @RequestPart("auction") AuctionRegistrationRequest request,
            final @RequestPart("file") MultipartFile file) {
        var response = registrationService.register(currentUser.currentUserId(), request, file);
        return ResponseEntity.created(URI.create("/api/v1/auctions/" + response.auctionId())).body(response);
    }

    // 경매 목록 조회 및 검색, 필터링 (동적 쿼리)
    @GetMapping("/v2")
    public ResponseEntity<Page<AuctionListResponse>> getAuctions(final @ModelAttribute AuctionSearchCondition condition, final @PageableDefault(size = 10) Pageable pageable) {
        final Page<AuctionListResponse> response = auctionManageService.getAuctions(condition, pageable);

        return ResponseEntity.ok(response);
    }

    // 경매 상세 조회
    @GetMapping("/{auctionId}/v2")
    public ResponseEntity<AuctionDetailResponse2> getAuctionDetail(final @PathVariable Long auctionId) {
        final AuctionDetailResponse2 response = auctionManageService.getAuctionDetail(auctionId);

        return ResponseEntity.ok(response);
    }

    // 수정
    @PutMapping("/{auctionId}")
    public ResponseEntity<AuctionDetailResponse2> updateAuction(final @PathVariable Long auctionId, final @Valid @RequestBody AuctionUpdateRequest request) {
        final AuctionDetailResponse2 response = auctionManageService.updateAuction(auctionId, currentUser.currentUserId(), request);

        return ResponseEntity.ok(response);
    }

    // 삭제
    @DeleteMapping("/{auctionId}")
    public ResponseEntity<Void> deleteAuction(final @PathVariable Long auctionId) {
        auctionManageService.deleteAuction(auctionId, currentUser.currentUserId());

        return ResponseEntity.noContent().build();
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
