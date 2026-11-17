package com.sesac.charity_auction.auction.controller;

import com.sesac.charity_auction.auction.dto.request.AuctionRegistrationRequest;
import com.sesac.charity_auction.auction.dto.response.AuctionRegistrationResponse;
import com.sesac.charity_auction.auction.service.AuctionRegistrationService;
import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;

@RestController
@RequestMapping("/api/v1/auctions")
@RequiredArgsConstructor
public class AuctionRegistrationController {
    private final AuctionRegistrationService registrationService;
    private final CurrentUserProvider currentUser;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<AuctionRegistrationResponse> register(
            @Valid @RequestPart("auction") AuctionRegistrationRequest request,
            @RequestPart("file") MultipartFile file) {
        var response = registrationService.register(currentUser.currentUserId(), request, file);
        return ResponseEntity.created(URI.create("/api/v1/auctions/" + response.auctionId())).body(response);
    }
}
