package com.sesac.charity_auction.point.service;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.point.dto.MyPointsResponse;
import com.sesac.charity_auction.point.dto.PointEntryResponse;
import com.sesac.charity_auction.point.dto.PointPageResponse;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional(readOnly = true)
public class PointQueryService {
    private static final int RECENT_SIZE = 8;
    private static final int MAX_PAGE_SIZE = 50;

    private final UserRepository userRepository;
    private final PointHistoryRepository historyRepository;

    public PointQueryService(UserRepository userRepository, PointHistoryRepository historyRepository) {
        this.userRepository = userRepository;
        this.historyRepository = historyRepository;
    }

    public MyPointsResponse getMyPoints(final long userId) {
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

    /** 내 포인트 내역 전체예요. 최신순이고, page는 0부터 시작해요. */
    public PointPageResponse getMyHistory(final long userId, final int page, final int size) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);

        long total = historyRepository.countByUserId(userId);
        return new PointPageResponse(
                historyRepository.findRecentByUserId(userId, PageRequest.of(safePage, safeSize)).stream()
                        .map(PointEntryResponse::from)
                        .toList(),
                safePage, safeSize, total, (int) ((total + safeSize - 1) / safeSize));
    }
}
