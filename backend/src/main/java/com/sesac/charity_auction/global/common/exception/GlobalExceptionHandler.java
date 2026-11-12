package com.sesac.charity_auction.global.common.exception;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.ConstraintViolationException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.beans.TypeMismatchException;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    private static final Logger log = LoggerFactory.getLogger(GlobalExceptionHandler.class);

    // 비즈니스 예외
    @ExceptionHandler(BusinessException.class)
    public ResponseEntity<ErrorResponse> handleBusinessException(BusinessException exception, HttpServletRequest request){

        HttpStatus status = exception.getStatus();

        // code가 있으면(기부처럼 프론트가 구분해야 하는 예외) 함께 내려줘요.
        ErrorResponse response = new ErrorResponse(status.value(), status.getReasonPhrase(), exception.getCode(), exception.getMessage(), request.getRequestURI());

        return ResponseEntity.status(status).body(response);
    }

    // 입력값 검증 실패
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationException(MethodArgumentNotValidException exception, HttpServletRequest request){

        String message = exception.getBindingResult()
                .getFieldErrors()
                .stream()
                .map(error -> error.getDefaultMessage())
                .findFirst()
                .orElse("잘못된 입력값입니다.");

        ErrorResponse response = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(), message, request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // RequestParam, PathVariable 검증 실패
    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolationException(ConstraintViolationException exception, HttpServletRequest request){

        String message = exception.getConstraintViolations()
                .stream()
                .map(violation -> violation.getMessage())
                .findFirst()
                .orElse("잘못된 입력값입니다.");

        ErrorResponse response = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(), message, request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 잘못된 JSON이거나 숫자 자리에 글자가 온 경우: 서버 오류가 아니라 잘못된 요청이에요.
    @ExceptionHandler({HttpMessageNotReadableException.class, TypeMismatchException.class})
    public ResponseEntity<ErrorResponse> handleBadRequest(Exception exception, HttpServletRequest request){

        ErrorResponse response = new ErrorResponse(HttpStatus.BAD_REQUEST.value(), HttpStatus.BAD_REQUEST.getReasonPhrase(), ErrorCode.UNKNOWN.name(), "잘못된 요청입니다.", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(response);
    }

    // 예상하지 못한 예외
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleException(Exception exception, HttpServletRequest request) {

        // 없는 주소(404), 지원하지 않는 메서드(405)처럼 스프링이 이미 상태 코드를 아는 예외는 그 상태를 그대로 써요.
        if (exception instanceof org.springframework.web.ErrorResponse springError) {
            HttpStatus status = HttpStatus.valueOf(springError.getStatusCode().value());
            ErrorResponse response = new ErrorResponse(status.value(), status.getReasonPhrase(), ErrorCode.UNKNOWN.name(), status.getReasonPhrase(), request.getRequestURI());
            return ResponseEntity.status(status).body(response);
        }

        log.error("처리하지 못한 예외가 발생했습니다.", exception);

        ErrorResponse response = new ErrorResponse(HttpStatus.INTERNAL_SERVER_ERROR.value(), HttpStatus.INTERNAL_SERVER_ERROR.getReasonPhrase(), ErrorCode.UNKNOWN.name(), "서버 내부 오류가 발생했습니다.", request.getRequestURI());

        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(response);
    }
}
