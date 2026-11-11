package com.sesac.charity_auction.point.service;

import com.sesac.charity_auction.global.error.BusinessException;
import com.sesac.charity_auction.global.error.ErrorCode;
import com.sesac.charity_auction.member.repository.UserRepository;
import com.sesac.charity_auction.point.dto.MyPointsResponse;
import com.sesac.charity_auction.point.dto.PointEntryResponse;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PointQueryService {

    private static final int RECENT_SIZE = 8;

    private final UserRepository userRepository;
    private final PointHistoryRepository historyRepository;

    public PointQueryService(UserRepository userRepository, PointHistoryRepository historyRepository) {
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    public MyPointsResponse getMyPoints(long userId) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN); // 없는 회원
        }
        return new MyPointsResponse(
                userRepository.findBalanceById(userId), // 잔액은 users.point_balance (가정 2)
                historyRepository.findRecentByUserId(userId, PageRequest.of(0, RECENT_SIZE)).stream()
                        .map(PointEntryResponse::from)
                        .toList()
        );
    }
}
