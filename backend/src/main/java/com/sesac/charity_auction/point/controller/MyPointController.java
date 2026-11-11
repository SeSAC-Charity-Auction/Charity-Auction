package com.sesac.charity_auction.point.controller;

import com.sesac.charity_auction.global.auth.CurrentUserProvider;
import com.sesac.charity_auction.point.dto.MyPointsResponse;
import com.sesac.charity_auction.point.service.PointQueryService;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/me")
public class MyPointController {

    private final PointQueryService pointQueryService;
    private final CurrentUserProvider currentUser;

    public MyPointController(PointQueryService pointQueryService, CurrentUserProvider currentUser) {
        this.pointQueryService = pointQueryService;
        this.currentUser = currentUser;
    }

    @GetMapping("/points")
    public MyPointsResponse myPoints() {
        // 로그인하지 않았으면 여기서 NOT_LOGGED_IN(401)이 나가요.
        return pointQueryService.getMyPoints(currentUser.currentUserId());
    }
}
