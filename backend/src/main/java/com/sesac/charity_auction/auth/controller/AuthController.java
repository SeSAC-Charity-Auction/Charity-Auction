package com.sesac.charity_auction.auth.controller;

import com.sesac.charity_auction.auth.dto.AuthTokens;
import com.sesac.charity_auction.auth.dto.LoginRequest;
import com.sesac.charity_auction.auth.dto.TokenResponse;
import com.sesac.charity_auction.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Duration;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {
    public static final String REFRESH_COOKIE = "refresh_token";
    private static final String REFRESH_COOKIE_PATH = "/api/v1/auth";

    private final AuthService authService;
    private final long refreshExpirationSeconds;
    private final boolean cookieSecure;

    public AuthController(final AuthService authService,
                          @Value("${security.refresh-token.expiration-seconds}") final long refreshExpirationSeconds,
                          @Value("${security.refresh-token.cookie-secure:false}") final boolean cookieSecure) {
        this.authService = authService;
        this.refreshExpirationSeconds = refreshExpirationSeconds;
        this.cookieSecure = cookieSecure;
    }

    @PostMapping("/login")
    public ResponseEntity<TokenResponse> login(final @Valid @RequestBody LoginRequest request) {
        return tokenResponse(authService.login(request));
    }

    @PostMapping("/refresh")
    public ResponseEntity<TokenResponse> refresh(
            final @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        return tokenResponse(authService.refresh(refreshToken));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(
            final @CookieValue(name = REFRESH_COOKIE, required = false) String refreshToken) {
        authService.logout(refreshToken);
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, clearRefreshCookie().toString())
                .build();
    }

    private ResponseEntity<TokenResponse> tokenResponse(final AuthTokens tokens) {
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, refreshCookie(tokens.refreshToken()).toString())
                .body(tokens.tokenResponse());
    }

    private ResponseCookie refreshCookie(final String refreshToken) {
        return ResponseCookie.from(REFRESH_COOKIE, refreshToken)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ofSeconds(refreshExpirationSeconds))
                .build();
    }

    private ResponseCookie clearRefreshCookie() {
        return ResponseCookie.from(REFRESH_COOKIE, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Strict")
                .path(REFRESH_COOKIE_PATH)
                .maxAge(Duration.ZERO)
                .build();
    }
}
