package com.sesac.charity_auction.global.auth;

import com.sesac.charity_auction.global.common.exception.BusinessException;
import com.sesac.charity_auction.global.common.exception.ErrorCode;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Component;

/**
 * 개발용 임시 구현: 요청 헤더 X-Dev-User-Id 값을 로그인한 회원 번호로 믿어요.
 * 누구나 다른 사람인 척할 수 있어서 local 프로필에서만 켜져요. 진짜 로그인(JWT)이 생기면 지워요.
 */
@Component
@Profile("local")
public class DevCurrentUserProvider implements CurrentUserProvider {
    public static final String HEADER = "X-Dev-User-Id";

    private final HttpServletRequest request;

    // 요청마다 다른 request 객체를 스프링이 대신 연결해 주는 프록시가 들어와요.
    public DevCurrentUserProvider(HttpServletRequest request) {
        this.request = request;
    }

    @Override
    public long currentUserId() {
        final String value = request.getHeader(HEADER);
        if (value == null || value.isBlank()) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
        try {
            return Long.parseLong(value.trim());
        } catch (final NumberFormatException e) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
    }
}
