package com.sesac.charity_auction.global.auth;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.springframework.boot.autoconfigure.condition.ConditionalOnMissingBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * 다른 CurrentUserProvider가 하나도 없을 때(local이 아니고 JWT도 아직 없을 때)의 안전한 기본값이에요.
 * 모든 요청을 "로그인하지 않음"으로 처리해서, 인증 없이 기부되는 일이 없어요.
 */
@Configuration
public class NotLoggedInProvider {
    @Bean
    @ConditionalOnMissingBean(CurrentUserProvider.class)
    public CurrentUserProvider notLoggedInCurrentUserProvider() {
        return () -> {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        };
    }
}
