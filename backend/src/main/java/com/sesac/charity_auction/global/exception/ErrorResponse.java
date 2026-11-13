package com.sesac.charity_auction.global.exception;

import com.fasterxml.jackson.annotation.JsonFormat;

import java.time.LocalDateTime;

/**
 * 실패 응답 본문: { "code": "...", "message": "..." }
 */
public record ErrorResponse(
        @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
        LocalDateTime timestamp,
        int status,
        String error,
        String code,
        String message,
        String path
) {

    //    public static ErrorResponse of(ErrorCode errorCode) {
//        return new ErrorResponse(errorCode.name(), errorCode.getMessage());
//    }
    public static ErrorResponse of(
            ErrorCode errorCode,
            String path
    ) {
        return new ErrorResponse(
                LocalDateTime.now(),
                errorCode.getStatus().value(),
                errorCode.getStatus().getReasonPhrase(),
                errorCode.name(),
                errorCode.getMessage(),
                path
        );
    }

    public static ErrorResponse of(
            ErrorCode errorCode,
            String message,
            String path
    ) {
        return new ErrorResponse(
                LocalDateTime.now(),
                errorCode.getStatus().value(),
                errorCode.getStatus().getReasonPhrase(),
                errorCode.name(),
                message,
                path
        );
    }

    public static ErrorResponse of(
            int status,
            String error,
            String code,
            String message,
            String path
    ) {
        return new ErrorResponse(
                LocalDateTime.now(),
                status,
                error,
                code,
                message,
                path
        );
    }
}
