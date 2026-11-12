package com.sesac.charity_auction.user.service;

import com.sesac.charity_auction.donation.repository.DonationRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.dto.response.MyProfileResponse;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;

@Service
@Transactional(readOnly = true)
public class MyProfileService {
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;

    public MyProfileService(UserRepository userRepository, DonationRepository donationRepository) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
    }

    public MyProfileResponse getMyProfile(long userId) {
        // 없는 회원이거나 탈퇴한 회원이면 로그인하지 않은 것과 같이 처리해요.
        final User user = userRepository.findById(userId)
                .filter(u -> !u.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        return new MyProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getNickname(),
                user.getImage(),
                user.getPointBalance(),
                user.getCreatedAt().toInstant(ZoneOffset.UTC).toString(),
                donationRepository.countByUserId(userId),
                donationRepository.sumAmountByUserId(userId)
        );
    }
}
