package com.sesac.charity_auction.global.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

/**
 * 실패 응답의 code 값. 이름은 프론트의 DonateErrorCode와 같아야 해요.
 */
@Getter
public enum ErrorCode {
    // 공통 예외
    INVALID_INPUT_VALUE(HttpStatus.BAD_REQUEST, "잘못된 입력값입니다."),
    INVALID_TYPE_VALUE(HttpStatus.BAD_REQUEST, "요청 데이터의 타입이 올바르지 않습니다."),
    RESOURCE_NOT_FOUND(HttpStatus.NOT_FOUND, "요청한 리소스를 찾을 수 없습니다."),
    METHOD_NOT_ALLOWED(HttpStatus.METHOD_NOT_ALLOWED, "지원하지 않는 HTTP 메서드입니다."),
    INTERNAL_SERVER_ERROR(HttpStatus.INTERNAL_SERVER_ERROR, "서버 내부 오류가 발생했습니다."),

    // 회원 관련 비즈니스 예외
    DUPLICATE_EMAIL(HttpStatus.CONFLICT, "이미 사용 중인 이메일입니다."),
    DUPLICATE_NICKNAME(HttpStatus.CONFLICT, "이미 사용 중인 닉네임입니다."),
    USER_NOT_FOUND(HttpStatus.NOT_FOUND, "사용자를 찾을 수 없습니다."),
    INVALID_NICKNAME(HttpStatus.BAD_REQUEST, "닉네임은 2자 이상 10자 이하로 입력해야 합니다."),

    // 프로필 사진
    INVALID_IMAGE(HttpStatus.BAD_REQUEST, "PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요."),
    IMAGE_TOO_LARGE(HttpStatus.CONTENT_TOO_LARGE, "이미지는 2MB 이하만 올릴 수 있어요."),

    // 인증 및 인가
    UNAUTHORIZED(HttpStatus.UNAUTHORIZED, "로그인이 필요합니다."),
    NOT_LOGGED_IN(HttpStatus.UNAUTHORIZED, "로그인이 필요해요."),
    FORBIDDEN(HttpStatus.FORBIDDEN, "접근 권한이 없습니다."),

    // 기부 및 경매 관련 비즈니스 예외
    TARGET_NOT_FOUND(HttpStatus.NOT_FOUND, "기부처를 찾을 수 없어요."),
    TARGET_CLOSED(HttpStatus.CONFLICT, "기부가 마감된 기부처예요."),
    INVALID_AMOUNT(HttpStatus.BAD_REQUEST, "기부 금액이 올바르지 않아요."),
    INSUFFICIENT_POINT(HttpStatus.CONFLICT, "포인트가 부족해요."),

    // 경매 관련 비즈니스 예외
    AUCTION_NOT_FOUND(HttpStatus.NOT_FOUND, "경매를 찾을 수 없습니다."),
    AUCTION_NOT_STARTED(HttpStatus.CONFLICT, "아직 시작되지 않은 경매입니다."),
    AUCTION_ALREADY_ENDED(HttpStatus.CONFLICT, "종료된 경매입니다."),
    AUCTION_CANCELLED(HttpStatus.CONFLICT, "취소된 경매입니다."),
    AUCTION_DELETED(HttpStatus.NOT_FOUND, "삭제된 경매입니다."),
    AUCTION_NOT_IN_PROGRESS(HttpStatus.BAD_REQUEST, "진행 중인 경매가 아닙니다."),

    // 입찰 관련 비즈니스 예외
    BID_PRICE_TOO_LOW(HttpStatus.BAD_REQUEST, "현재 최고 입찰 금액보다 높은 금액을 입력해주세요."),
    BID_NOT_ALLOWED(HttpStatus.FORBIDDEN, "본인이 등록한 경매에는 입찰할 수 없습니다."),
    INVALID_BID_PRICE(HttpStatus.BAD_REQUEST, "입찰 금액은 0보다 커야 합니다."),

    // 기본 비즈니스 예외
    UNKNOWN(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 오류가 발생했어요.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }
}
