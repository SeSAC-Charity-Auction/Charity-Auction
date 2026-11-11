package com.sesac.charity_auction.global.auth;

/**
 * "지금 요청한 사람이 누구인가"를 알려 주는 창구예요.
 * 로그인(JWT)을 만드는 팀원은 이 인터페이스를 구현한 클래스 하나만 만들면 돼요.
 * 서비스와 컨트롤러는 이 인터페이스만 바라보기 때문에, 그때 다른 코드는 바꿀 필요가 없어요.
 */
public interface CurrentUserProvider {

    /**
     * @return 로그인한 회원의 user_id
     * @throws com.sesac.charity_auction.global.error.BusinessException 로그인하지 않았으면 NOT_LOGGED_IN
     */
    long currentUserId();
}
