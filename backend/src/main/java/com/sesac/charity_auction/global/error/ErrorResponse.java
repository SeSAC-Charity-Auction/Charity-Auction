package com.sesac.charity_auction.global.error;

/** 실패 응답 본문: { "code": "...", "message": "..." } */
public record ErrorResponse(String code, String message) {

    public static ErrorResponse of(ErrorCode errorCode) {
        return new ErrorResponse(errorCode.name(), errorCode.getMessage());
    }
}
