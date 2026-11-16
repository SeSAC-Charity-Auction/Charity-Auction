package com.sesac.charity_auction.global.auth;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityContextCurrentUserProvider implements CurrentUserProvider {
    @Override
    public long currentUserId() {
        final Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication instanceof AnonymousAuthenticationToken) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
        try {
            return Long.parseLong(authentication.getName());
        } catch (final NumberFormatException exception) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
    }
}
