package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

class AuctionCandidateTest {

    private AuctionCandidate candidate;

    private LocalDateTime now;
    private LocalDateTime deadline;

    @BeforeEach
    void setUp() {
        now = LocalDateTime.of(2026, 11, 17, 10, 0);
        deadline = now.plusHours(24);

        candidate = AuctionCandidate.create(
                null,   // Auction
                null,   // User
                null,   // Bid
                1L,     // 순위
                10000L  // 입찰 금액
        );
    }

    @Test
    @DisplayName("낙찰 후보 생성 시 WAITING 상태로 생성된다.")
    void createCandidate() {

        assertEquals(
                AuctionCandidateStatus.WAITING,
                candidate.getStatus()
        );

        assertEquals(1L, candidate.getRank());
        assertEquals(10000L, candidate.getBidPrice());
    }

    @Test
    @DisplayName("낙찰 기회를 부여하면 OFFERED 상태가 된다.")
    void offerCandidate() {

        candidate.offer(now, deadline);

        assertEquals(
                AuctionCandidateStatus.OFFERED,
                candidate.getStatus()
        );

        assertEquals(now, candidate.getOfferedAt());
        assertEquals(deadline, candidate.getDeadlineAt());
    }

    @Test
    @DisplayName("낙찰 대기 상태가 아닌 후보에게 기회를 부여하면 예외가 발생한다.")
    void offerCandidateWithInvalidStatus() {

        candidate.offer(now, deadline);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.offer(now, deadline)
        );

        assertEquals(
                ErrorCode.CANDIDATE_NOT_WAITING,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 기한이 유효하면 낙찰 완료된다.")
    void completeCandidate() {

        candidate.offer(now, deadline);

        LocalDateTime completedAt = now.plusHours(1);

        candidate.complete(completedAt);

        assertEquals(
                AuctionCandidateStatus.COMPLETED,
                candidate.getStatus()
        );

        assertEquals(completedAt, candidate.getProcessedAt());
    }

    @Test
    @DisplayName("낙찰 기회를 받지 않은 후보는 낙찰 완료할 수 없다.")
    void completeCandidateWithInvalidStatus() {

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.complete(now)
        );

        assertEquals(
                ErrorCode.CANDIDATE_NOT_OFFERED,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 기한이 지나면 낙찰 완료할 수 없다.")
    void completeCandidateAfterDeadline() {

        candidate.offer(now, deadline);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.complete(deadline)
        );

        assertEquals(
                ErrorCode.CANDIDATE_EXPIRED,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰을 거절하면 REJECTED 상태가 된다.")
    void rejectCandidate() {

        candidate.offer(now, deadline);

        LocalDateTime rejectedAt = now.plusHours(1);

        candidate.reject(rejectedAt);

        assertEquals(
                AuctionCandidateStatus.REJECTED,
                candidate.getStatus()
        );

        assertEquals(rejectedAt, candidate.getProcessedAt());
    }

    @Test
    @DisplayName("낙찰 기회를 받지 않은 후보는 거절할 수 없다.")
    void rejectCandidateWithInvalidStatus() {

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.reject(now)
        );

        assertEquals(
                ErrorCode.CANDIDATE_NOT_OFFERED,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 기한이 지나면 EXPIRED 상태가 된다.")
    void expireCandidate() {

        candidate.offer(now, deadline);

        LocalDateTime expiredAt = deadline.plusSeconds(1);

        candidate.expire(expiredAt);

        assertEquals(
                AuctionCandidateStatus.EXPIRED,
                candidate.getStatus()
        );

        assertEquals(expiredAt, candidate.getProcessedAt());
    }

    @Test
    @DisplayName("낙찰 기한이 지나지 않았다면 만료 처리할 수 없다.")
    void expireCandidateBeforeDeadline() {

        candidate.offer(now, deadline);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.expire(now.plusHours(1))
        );

        assertEquals(
                ErrorCode.CANDIDATE_NOT_EXPIRED,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 대기 후보는 다른 후보자의 낙찰 완료로 NOT_SELECTED 상태가 된다.")
    void notSelectedCandidate() {

        candidate.notSelected(now);

        assertEquals(
                AuctionCandidateStatus.NOT_SELECTED,
                candidate.getStatus()
        );

        assertEquals(now, candidate.getProcessedAt());
    }

    @Test
    @DisplayName("낙찰 대기 상태가 아닌 후보는 NOT_SELECTED 처리할 수 없다.")
    void notSelectedCandidateWithInvalidStatus() {

        candidate.offer(now, deadline);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.notSelected(now)
        );

        assertEquals(
                ErrorCode.CANDIDATE_NOT_WAITING,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 기한이 현재 시간과 같으면 낙찰 완료할 수 없다.")
    void completeCandidateExactlyAtDeadline() {

        candidate.offer(now, deadline);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.complete(deadline)
        );

        assertEquals(
                ErrorCode.CANDIDATE_EXPIRED,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("현재 시간보다 이전의 낙찰 기한은 설정할 수 없다.")
    void offerCandidateWithPastDeadline() {

        LocalDateTime pastDeadline = now.minusMinutes(1);

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.offer(now, pastDeadline)
        );

        assertEquals(
                ErrorCode.INVALID_CANDIDATE_DEADLINE,
                exception.getErrorCode()
        );
    }

    @Test
    @DisplayName("낙찰 기한이 null이면 설정할 수 없다.")
    void offerCandidateWithNullDeadline() {

        BusinessException exception = assertThrows(
                BusinessException.class,
                () -> candidate.offer(now, null)
        );

        assertEquals(
                ErrorCode.INVALID_CANDIDATE_DEADLINE,
                exception.getErrorCode()
        );
    }
}
