package com.sesac.charity_auction.global.error;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e) {
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code));
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOthers(Exception e) throws Exception {
        // 잘못된 JSON, 없는 주소 등 스프링이 상태 코드를 이미 아는 오류는 그 상태를 그대로 쓰고 code는 UNKNOWN으로 줘요.
        if (e instanceof org.springframework.web.ErrorResponse springError) {
            return ResponseEntity.status(springError.getStatusCode())
                    .body(ErrorResponse.of(ErrorCode.UNKNOWN));
        }
        // /api/donation-targets/abc 처럼 숫자 자리에 글자가 오면 서버 오류가 아니라 잘못된 요청이에요.
        if (e instanceof org.springframework.beans.TypeMismatchException) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(ErrorCode.UNKNOWN));
        }
        log.error("처리되지 않은 예외", e);
        return ResponseEntity.status(ErrorCode.UNKNOWN.getStatus()).body(ErrorResponse.of(ErrorCode.UNKNOWN));
    }
}
