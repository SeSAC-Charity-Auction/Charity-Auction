package com.sesac.charity_auction.user.controller;

import com.sesac.charity_auction.user.dto.request.SignupRequest;
import com.sesac.charity_auction.user.dto.response.DuplicateCheckResponse;
import com.sesac.charity_auction.user.dto.response.SignupResponse;
import com.sesac.charity_auction.user.service.UserService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
@Validated
public class UserController {
    private final UserService userService;

    @GetMapping("/check-email")
    public ResponseEntity<DuplicateCheckResponse> checkEmail(final
                                                             @RequestParam
                                                             @NotBlank(message = "이메일을 입력해주세요.")
                                                             @Email(message = "올바른 이메일 형식이 아닙니다.")
                                                             String email
    ) {
        return ResponseEntity.ok(userService.checkEmail(email));
    }

    @GetMapping("/check-nickname")
    public ResponseEntity<DuplicateCheckResponse> checkNickname(final
                                                                @RequestParam
                                                                @NotBlank(message = "닉네임을 입력해주세요.")
                                                                @Size(min = 2, max = 10, message = "닉네임은 2자 이상 10자 이하로 입력해야 합니다.")
                                                                String nickname
    ) {
        return ResponseEntity.ok(userService.checkNickname(nickname));
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(final @Valid @RequestBody SignupRequest request) {
        final SignupResponse response = userService.signup(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
