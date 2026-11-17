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

import java.time.LocalDateTime;
import java.time.ZoneOffset;

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

    /**
     * 확인한 적이 없으면(null) 처음부터 센다는 뜻으로 아주 옛날 시각을 써요.
     */
    public static LocalDateTime sinceOf(final LocalDateTime checkedAt) {
        return checkedAt == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : checkedAt;
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

    /**
     * 내 포인트 내역 전체예요. 최신순이고, page는 0부터 시작해요.
     */
    public PointPageResponse getMyHistory(final long userId, final int page, final int size) {
        if (!userRepository.existsById(userId)) {
            throw new BusinessException(ErrorCode.NOT_LOGGED_IN);
        }
        final int safePage = Math.max(0, page);
        final int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);

        final long total = historyRepository.countByUserId(userId);
        return new PointPageResponse(
                historyRepository.findRecentByUserId(userId, PageRequest.of(safePage, safeSize)).stream()
                        .map(PointEntryResponse::from)
                        .toList(),
                safePage, safeSize, total, (int) ((total + safeSize - 1) / safeSize));
    }

    /**
     * "내 포인트를 확인했다"고 기록해요. 그동안 쌓인 새 적립이 있었으면 true를 돌려줘요.
     * 확인한 시각을 먼저 정해 두어서, 이 사이에 새로 적립된 포인트는 계속 "새 포인트"로 남아요.
     */
    @Transactional
    public boolean markPointsSeen(final long userId) {
        final LocalDateTime now = LocalDateTime.now(ZoneOffset.UTC);
        final var user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        final boolean hadNew = historyRepository.existsEarnedAfter(userId, sinceOf(user.getPointsCheckedAt()));
        userRepository.markPointsChecked(userId, now);
        return hadNew;
    }
}
