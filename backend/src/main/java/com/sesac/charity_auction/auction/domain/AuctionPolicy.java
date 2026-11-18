package com.sesac.charity_auction.auction.domain;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;

import java.time.Duration;
import java.time.LocalDateTime;

/** 경매 등록 규칙이에요. */
public final class AuctionPolicy {
    /** 시작 가격을 정하지 않았을 때의 기본값이자, 정할 수 있는 가장 낮은 값이에요. */
    public static final long MIN_START_PRICE = 1000L;
    public static final long DEFAULT_START_PRICE = MIN_START_PRICE;
    public static final Duration DEFAULT_DURATION = Duration.ofHours(24);
    public static final Duration MIN_DURATION = Duration.ofHours(1);
    public static final Duration MAX_DURATION = Duration.ofDays(7);
    public static final Duration MAX_SCHEDULE_AHEAD = Duration.ofDays(30);

    private AuctionPolicy() {
    }

    public static void validateScheduleFields(final LocalDateTime startAt, final LocalDateTime endAt) {
        if (startAt == null && endAt != null) {
            throw new BusinessException(ErrorCode.INVALID_AUCTION_TIME, "바로 시작하는 경매는 마감 시각을 정할 수 없어요. 시작 24시간 뒤에 마감돼요.");
        }
        if (startAt != null && endAt == null) {
            throw new BusinessException(ErrorCode.INVALID_AUCTION_TIME, "시작 시각을 예약하면 마감 시각도 정해 주세요.");
        }
    }

    public static void validateSchedule(final LocalDateTime now, final LocalDateTime startAt,
                                        final LocalDateTime endAt, final boolean scheduled) {
        if (scheduled && !startAt.isAfter(now)) {
            throw new BusinessException(ErrorCode.INVALID_AUCTION_TIME, "예약한 시작 시각이 이미 지났어요. 지금보다 뒤의 시각을 골라 주세요.");
        }
        if (scheduled && startAt.isAfter(now.plus(MAX_SCHEDULE_AHEAD))) {
            throw new BusinessException(ErrorCode.INVALID_AUCTION_TIME, "시작 시각은 30일 안으로만 예약할 수 있어요.");
        }
        final Duration duration = Duration.between(startAt, endAt);
        if (duration.compareTo(MIN_DURATION) < 0 || duration.compareTo(MAX_DURATION) > 0) {
            throw new BusinessException(ErrorCode.INVALID_AUCTION_TIME, "경매 기간(시작~마감)은 1시간 이상 7일 이하로 정해 주세요.");
        }
    }
}
