package com.sesac.charity_auction.user.dto.response;

/**
 * 마이페이지 응답. 필드 이름은 회원 ERD(users)를 따라요.
 * 비밀번호처럼 밖으로 내보내면 안 되는 값은 담지 않아요.
 */
public record MyProfileResponse(
        long userId,
        String email,
        String nickname,
        String userImage,    // 없으면 null
        long point,          // 지금 기부할 수 있는 포인트
        String createdAt,    // 가입일시 (ISO 8601, UTC)
        long donationCount,  // 내가 기부한 횟수
        long totalDonation   // 내가 기부한 총 포인트
) {
}
