package com.sesac.charity_auction.donation.controller;

import com.sesac.charity_auction.donation.dto.DonationTargetDetailResponse;
import com.sesac.charity_auction.donation.service.DonationQueryService;
import com.sesac.charity_auction.donation.service.TargetImageService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/donation-targets")
public class DonationTargetController {
    private final DonationQueryService queryService;
    private final TargetImageService imageService;
    private final CurrentUserProvider currentUser;

    public DonationTargetController(final DonationQueryService queryService, final TargetImageService imageService,
                                    final CurrentUserProvider currentUser) {
        this.queryService = queryService;
        this.imageService = imageService;
        this.currentUser = currentUser;
    }

    @GetMapping("/{targetId}")
    public DonationTargetDetailResponse detail(final @PathVariable long targetId) {
        return queryService.getTargetDetail(targetId);
    }

    // POST /api/donation-targets/{targetId}/image : 기부처 이미지 올리기·바꾸기 (ADMIN 또는 개발 환경). 성공하면 { targetImage }
    @PostMapping("/{targetId}/image")
    public Map<String, String> uploadImage(final @PathVariable long targetId,
                                           final @RequestParam("file") MultipartFile file) {
        return Map.of("targetImage", imageService.upload(currentUser.currentUserId(), targetId, file));
    }
}
