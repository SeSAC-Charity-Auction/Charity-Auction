package com.sesac.charity_auction.user.controller;

import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import com.sesac.charity_auction.user.dto.response.MyProfileResponse;
import com.sesac.charity_auction.user.service.MyProfileService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MyProfileController {
    private final MyProfileService myProfileService;
    private final CurrentUserProvider currentUser;

    public MyProfileController(MyProfileService myProfileService, CurrentUserProvider currentUser) {
        this.myProfileService = myProfileService;
        this.currentUser = currentUser;
    }

    // GET /api/me : 마이페이지의 내 정보. 로그인하지 않았으면 NOT_LOGGED_IN(401)이에요.
    @GetMapping
    public MyProfileResponse myProfile() {
        return myProfileService.getMyProfile(currentUser.currentUserId());
    }
}
