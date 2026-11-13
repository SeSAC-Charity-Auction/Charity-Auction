package com.sesac.charity_auction.user.service;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.dto.request.SignupRequest;
import com.sesac.charity_auction.user.dto.response.DuplicateCheckResponse;
import com.sesac.charity_auction.user.dto.response.SignupResponse;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class UserService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Transactional
    public SignupResponse signup(final SignupRequest request) {

        if (userRepository.existsByEmailAndIsDeletedFalse(request.email())) {
            throw new BusinessException(ErrorCode.DUPLICATE_EMAIL);
        }

        if (userRepository.existsByNicknameAndIsDeletedFalse(request.nickname())) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }

        final User user = User.create(request.email(), passwordEncoder.encode(request.password()), request.nickname(), request.name());

        final User savedUser = userRepository.save(user);

        return new SignupResponse(savedUser.getId(), savedUser.getEmail(), savedUser.getNickname());
    }

    public DuplicateCheckResponse checkEmail(final String email) {
        final boolean exists = userRepository.existsByEmailAndIsDeletedFalse(email);

        return new DuplicateCheckResponse(!exists, exists ? ErrorCode.DUPLICATE_EMAIL.getMessage() : "사용 가능한 이메일입니다.");
    }

    public DuplicateCheckResponse checkNickname(final String nickname) {
        final boolean exists = userRepository.existsByNicknameAndIsDeletedFalse(nickname);

        return new DuplicateCheckResponse(!exists, exists ? ErrorCode.DUPLICATE_NICKNAME.getMessage() : "사용 가능한 닉네임입니다.");
    }
}
