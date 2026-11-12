package com.sesac.charity_auction.global.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.hibernate.TypeMismatchException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 비즈니스 예외
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusiness(BusinessException e, HttpServletRequest request) {
        ErrorCode code = e.getErrorCode();
        return ResponseEntity.status(code.getStatus()).body(ErrorResponse.of(code, request.getRequestURI()));
    }

    // @RequestBody 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleMethodArgumentNotValidException(
            MethodArgumentNotValidException e,
            HttpServletRequest request
    ) {
        String message = e.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .filter(msg -> msg != null && !msg.isBlank())
                .findFirst()
                .orElse(ErrorCode.INVALID_INPUT_VALUE.getMessage());

        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(
                        errorCode,
                        message,
                        request.getRequestURI()
                ));
    }

    // @RequestParam, @PathVariable 검증 실패
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(
            ConstraintViolationException e,
            HttpServletRequest request
    ) {
        String message = e.getConstraintViolations()
                .stream()
                .map(violation -> violation.getMessage())
                .findFirst()
                .orElse(ErrorCode.INVALID_INPUT_VALUE.getMessage());

        ErrorCode errorCode = ErrorCode.INVALID_INPUT_VALUE;

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(
                        errorCode,
                        message,
                        request.getRequestURI()
                ));
    }

    // 잘못된 타입 전달
    @ExceptionHandler(TypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatchException(
            TypeMismatchException e,
            HttpServletRequest request
    ) {
        ErrorCode errorCode = ErrorCode.INVALID_TYPE_VALUE;

        return ResponseEntity
                .status(errorCode.getStatus())
                .body(ErrorResponse.of(errorCode, request.getRequestURI()));
    }


    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleOthers(Exception e, HttpServletRequest request) throws Exception {
        // 잘못된 JSON, 없는 주소 등 스프링이 상태 코드를 이미 아는 오류는 그 상태를 그대로 쓰고 code는 UNKNOWN으로 줘요.
        if (e instanceof org.springframework.web.ErrorResponse springError) {
            return ResponseEntity.status(springError.getStatusCode())
                    .body(ErrorResponse.of(ErrorCode.UNKNOWN, request.getRequestURI()));
        }
        // /api/donation-targets/abc 처럼 숫자 자리에 글자가 오면 서버 오류가 아니라 잘못된 요청이에요.
        if (e instanceof org.springframework.beans.TypeMismatchException) {
            return ResponseEntity.badRequest().body(ErrorResponse.of(ErrorCode.UNKNOWN, request.getRequestURI()));
        }
        log.error("처리되지 않은 예외", e);
        return ResponseEntity.status(ErrorCode.UNKNOWN.getStatus()).body(ErrorResponse.of(ErrorCode.UNKNOWN, request.getRequestURI()));
    }
}
