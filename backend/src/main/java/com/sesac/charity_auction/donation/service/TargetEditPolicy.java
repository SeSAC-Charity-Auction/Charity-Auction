package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.user.domain.Role;
import com.sesac.charity_auction.user.entity.User;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Component;

/**
 * 기부처 정보(이미지)를 고칠 수 있는 사람의 규칙이에요.
 * ADMIN이거나, 개발 환경(local 프로필)으로 실행 중이면 로그인한 회원 누구나 할 수 있어요.
 */
@Component
public class TargetEditPolicy {
    private final boolean devEnvironment;

    public TargetEditPolicy(final Environment environment) {
        this.devEnvironment = environment.acceptsProfiles(Profiles.of("local"));
    }

    public boolean canEdit(final User user) {
        return devEnvironment || user.getRole() == Role.ADMIN;
    }
}
