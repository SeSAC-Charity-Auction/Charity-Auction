package com.sesac.charity_auction.global.common.exception;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@JsonInclude(JsonInclude.Include.NON_NULL) // code가 없으면 응답에서 빼요
public class ErrorResponse {

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private final LocalDateTime timestamp;
    private final int status;
    private final String error;
    // 프론트가 실패 이유를 구분하는 코드 (DonateErrorCode와 같은 이름). 없을 수 있어요.
    private final String code;
    private final String message;
    private final String path;

    public ErrorResponse(int status, String error, String message, String path) {
        this(status, error, null, message, path);
    }

    public ErrorResponse(int status, String error, String code, String message, String path) {
        this.timestamp = LocalDateTime.now();
        this.status = status;
        this.error = error;
        this.code = code;
        this.message = message;
        this.path = path;
    }
}
