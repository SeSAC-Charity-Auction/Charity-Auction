package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.donation.domain.Donation;
import com.sesac.charity_auction.donation.domain.DonationPolicy;
import com.sesac.charity_auction.donation.domain.DonationTarget;
import com.sesac.charity_auction.donation.dto.DonationResponse;
import com.sesac.charity_auction.donation.repository.DonationRepository;
import com.sesac.charity_auction.donation.repository.DonationTargetRepository;
import com.sesac.charity_auction.global.common.exception.BusinessException;
import com.sesac.charity_auction.global.common.exception.ErrorCode;
import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class DonationService {

    private final UserRepository userRepository;
    private final DonationTargetRepository targetRepository;
    private final DonationRepository donationRepository;
    private final PointHistoryRepository pointHistoryRepository;

    public DonationService(UserRepository userRepository,
                           DonationTargetRepository targetRepository,
                           DonationRepository donationRepository,
                           PointHistoryRepository pointHistoryRepository) {
        this.userRepository = userRepository;
        this.targetRepository = targetRepository;
        this.donationRepository = donationRepository;
        this.pointHistoryRepository = pointHistoryRepository;
    }

    /**
     * 하나의 트랜잭션: 중간에 BusinessException이 나면 앞에서 바꾼 것(잔액 차감 등)이 모두 되돌려져요.
     */
    @Transactional
    public DonationResponse donate(long userId, Long targetId, Long amount) {
        // 화면의 검증은 믿지 않아요. 값이 없거나 규칙에 안 맞으면 여기서 막아요.
        if (targetId == null) {
            throw new BusinessException(ErrorCode.TARGET_NOT_FOUND);
        }
        if (amount == null || !DonationPolicy.isValid(amount)) {
            throw new BusinessException(ErrorCode.INVALID_AMOUNT);
        }

        // 2. 잔액 차감 (조건부 UPDATE): 영향 행이 0이면 잔액 부족
        if (userRepository.deductBalance(userId, amount) == 0) {
            if (!userRepository.existsById(userId)) {
                throw new BusinessException(ErrorCode.NOT_LOGGED_IN); // 없는 회원
            }
            throw new BusinessException(ErrorCode.INSUFFICIENT_POINT);
        }

        // 3. 기부처 누적액 증가 (열려 있는 기부처만): 영향 행이 0이면 마감 또는 없음
        if (targetRepository.addDonation(targetId, amount) == 0) {
            if (!targetRepository.existsById(targetId)) {
                throw new BusinessException(ErrorCode.TARGET_NOT_FOUND);
            }
            throw new BusinessException(ErrorCode.TARGET_CLOSED);
        }

        // 4. 기부 기록. 참조만 가져와서(getReference) 불필요한 조회 쿼리를 줄여요.
        User user = userRepository.getReferenceById(userId);
        DonationTarget target = targetRepository.getReferenceById(targetId);
        Donation donation = donationRepository.save(new Donation(target, user, amount));

        // 5. 포인트 사용 기록(장부)
        pointHistoryRepository.save(PointHistory.usedForDonation(user, donation, amount));

        return new DonationResponse(amount, userRepository.findBalanceById(userId));
    }
}
