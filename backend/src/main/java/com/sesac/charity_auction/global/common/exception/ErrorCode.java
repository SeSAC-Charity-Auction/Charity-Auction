package com.sesac.charity_auction.global.common.exception;

import org.springframework.http.HttpStatus;

/**
 * 실패 응답의 code 값. 이름은 프론트의 DonateErrorCode와 같아야 해요.
 */
public enum ErrorCode {
    NOT_LOGGED_IN(HttpStatus.UNAUTHORIZED, "로그인이 필요해요."),
    TARGET_NOT_FOUND(HttpStatus.NOT_FOUND, "기부처를 찾을 수 없어요."),
    TARGET_CLOSED(HttpStatus.CONFLICT, "기부가 마감된 기부처예요."),
    INVALID_AMOUNT(HttpStatus.BAD_REQUEST, "기부 금액이 올바르지 않아요."),
    INSUFFICIENT_POINT(HttpStatus.CONFLICT, "포인트가 부족해요."),
    UNKNOWN(HttpStatus.INTERNAL_SERVER_ERROR, "알 수 없는 오류가 발생했어요.");

    private final HttpStatus status;
    private final String message;

    ErrorCode(HttpStatus status, String message) {
        this.status = status;
        this.message = message;
    }

    public HttpStatus getStatus() { return status; }
    public String getMessage() { return message; }
}
