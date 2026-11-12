package com.sesac.charity_auction.global.common.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class BusinessException extends RuntimeException{

    private final HttpStatus status;

    // 프론트가 실패 이유를 구분하는 코드예요. (예: INSUFFICIENT_POINT) 코드가 필요 없는 예외는 null이에요.
    private final String code;

    public BusinessException(HttpStatus status, String message){
        this(status, null, message);
    }

    // 기부처럼 프론트가 코드로 구분해야 하는 예외는 ErrorCode로 만들어요.
    public BusinessException(ErrorCode errorCode){
        this(errorCode.getStatus(), errorCode.name(), errorCode.getMessage());
    }

    private BusinessException(HttpStatus status, String code, String message){
        super(message);
        this.status = status;
        this.code = code;
    }
}
