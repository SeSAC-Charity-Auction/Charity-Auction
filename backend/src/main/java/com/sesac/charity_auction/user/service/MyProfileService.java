package com.sesac.charity_auction.user.service;

import com.sesac.charity_auction.donation.repository.DonationRepository;
import com.sesac.charity_auction.donation.service.TargetEditPolicy;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.dto.response.MyProfileResponse;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.ZoneOffset;

@Service
@Transactional(readOnly = true)
public class MyProfileService {
    private final UserRepository userRepository;
    private final DonationRepository donationRepository;
    private final TargetEditPolicy targetEditPolicy;

    public MyProfileService(UserRepository userRepository, DonationRepository donationRepository,
                            TargetEditPolicy targetEditPolicy) {
        this.userRepository = userRepository;
        this.donationRepository = donationRepository;
        this.targetEditPolicy = targetEditPolicy;
    }

    public MyProfileResponse getMyProfile(final long userId) {
        // 없는 회원이거나 탈퇴한 회원이면 로그인하지 않은 것과 같이 처리해요.
        final User user = userRepository.findById(userId)
                .filter(filterUser -> !filterUser.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        return new MyProfileResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getNickname(),
                user.getImage(),
                user.getPointBalance(),
                user.getCreatedAt().toInstant(ZoneOffset.UTC).toString(),
                donationRepository.countByUserId(userId),
                donationRepository.sumAmountByUserId(userId),
                targetEditPolicy.canEdit(user)
        );
    }

    /**
     * 닉네임을 바꿔요. 2~10자이고, 다른 회원이 쓰고 있으면 DUPLICATE_NICKNAME이에요.
     *
     * @return 저장된 새 닉네임
     */
    @Transactional
    public String changeNickname(final long userId, final String rawNickname) {
        final User user = userRepository.findById(userId)
                .filter(filterUser -> !filterUser.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        final String nickname = rawNickname == null ? "" : rawNickname.strip();
        if (nickname.length() < 2 || nickname.length() > 10) {
            throw new BusinessException(ErrorCode.INVALID_NICKNAME);
        }
        if (nickname.equals(user.getNickname())) {
            return nickname;
        }
        if (userRepository.existsByNicknameAndIsDeletedFalseAndIdNot(nickname, userId)) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME);
        }

        user.changeNickname(nickname);
        try {
            // 동시에 같은 닉네임을 고른 경우에는 DB의 UNIQUE 인덱스가 막아 줘요.
            userRepository.saveAndFlush(user);
        } catch (final DataIntegrityViolationException exception) {
            throw new BusinessException(ErrorCode.DUPLICATE_NICKNAME, exception);
        }
        return nickname;
    }

    /**
     * 회원 탈퇴. users.is_deleted를 true로 바꿔요. 이미 탈퇴한 회원이면 NOT_LOGGED_IN이에요.
     */
    @Transactional
    public void withdraw(final long userId) {
        final User user = userRepository.findById(userId)
                .filter(filterUser -> !filterUser.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));
        user.withdraw();
    }
}
