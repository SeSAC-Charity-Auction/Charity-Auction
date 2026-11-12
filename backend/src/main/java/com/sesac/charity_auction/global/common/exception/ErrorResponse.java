package com.sesac.charity_auction.global.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.LocalDateTime;

/**
 * @param code 프론트가 실패 이유를 구분하는 코드 (DonateErrorCode와 같은 이름). 없을 수 있어요.
 */
@JsonInclude(JsonInclude.Include.NON_NULL) // code가 없으면 응답에서 빼요
public record ErrorResponse(@JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss") LocalDateTime timestamp, int status,
                            String error, String code, String message, String path) {
    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, null, message, path);
    }

    public ErrorResponse(int status, String error, String code, String message, String path) {
        this(LocalDateTime.now(), status, error, code, message, path);
    }
}
