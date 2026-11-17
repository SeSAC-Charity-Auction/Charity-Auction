package com.sesac.charity_auction.auctioncandidate.domain;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "auction_candidates",
        uniqueConstraints = {   // 유니크 제약 조건 설정
                @UniqueConstraint(name = "uk_auction_candidate_user", columnNames = {"auction_id", "user_id"}), // 한 경매에서 한 사용자는 하나의 후보로만 등록
                @UniqueConstraint(name = "uk_auction_candidate_bid", columnNames = {"bid_id"}), // 하나의 입찰 내역은 후보 하나에만 연결
                @UniqueConstraint(name = "uk_auction_candidate_rank", columnNames = {"auction_id", "candidate_rank"}) // 한 경매에서 후보 순위 중복 방지
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuctionCandidate {

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'WAITING'")
    @Column(nullable = false)
    private AuctionCandidateStatus status = AuctionCandidateStatus.WAITING;
    @Id
    @Column(name = "candidate_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "candidate_rank", nullable = false)
    private Long rank;
    @Column(nullable = false)
    private Long bidPrice;
    private LocalDateTime offeredAt;

    private LocalDateTime deadlineAt;

    private LocalDateTime processedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    public static AuctionCandidate create(final Auction auction, final User user, final Bid bid, final Long rank, final Long bidPrice) {
        final AuctionCandidate auctionCandidate = new AuctionCandidate();

        auctionCandidate.auction = auction;
        auctionCandidate.user = user;
        auctionCandidate.bid = bid;
        auctionCandidate.rank = rank;
        auctionCandidate.bidPrice = bidPrice;

        return auctionCandidate;
    }

    public void offer(final LocalDateTime now, final LocalDateTime deadlineAt) {
        validateStatus(AuctionCandidateStatus.WAITING, ErrorCode.CANDIDATE_NOT_WAITING);

        if (deadlineAt == null || !deadlineAt.isAfter(now)) {
            throw new BusinessException(ErrorCode.INVALID_CANDIDATE_DEADLINE);
        }
        this.status = AuctionCandidateStatus.OFFERED;
        this.offeredAt = now;
        this.deadlineAt = deadlineAt;
    }

    // 낙찰 완료
    public void complete(final LocalDateTime now) {
        validateStatus(AuctionCandidateStatus.OFFERED, ErrorCode.CANDIDATE_NOT_OFFERED);
        validateDeadline(now);

        this.status = AuctionCandidateStatus.COMPLETED;
        this.processedAt = now;
    }

    // 낙찰 거절
    public void reject(final LocalDateTime now) {
        validateStatus(AuctionCandidateStatus.OFFERED, ErrorCode.CANDIDATE_NOT_OFFERED);
        validateDeadline(now);

        this.status = AuctionCandidateStatus.REJECTED;
        this.processedAt = now;
    }

    public void expire(final LocalDateTime now) {
        validateStatus(AuctionCandidateStatus.OFFERED, ErrorCode.CANDIDATE_NOT_OFFERED);
        validateExpired(now);

        this.status = AuctionCandidateStatus.EXPIRED;
        this.processedAt = now;
    }

    // 다른 후보자의 낙찰 완료로 기회 종료
    public void notSelected(final LocalDateTime now) {
        validateStatus(AuctionCandidateStatus.WAITING, ErrorCode.CANDIDATE_NOT_WAITING);
        this.status = AuctionCandidateStatus.NOT_SELECTED;
        this.processedAt = now;
    }

    // 후보자 상태 검증
    private void validateStatus(final AuctionCandidateStatus expectedStatus, final ErrorCode errorCode) {
        if (this.status != expectedStatus) {
            throw new BusinessException(errorCode);
        }
    }

    // 아직 낙찰 기한이 유효한지 검증
    private void validateDeadline(final LocalDateTime now) {
        if (this.deadlineAt == null || !now.isBefore(this.deadlineAt)) {
            throw new BusinessException(ErrorCode.CANDIDATE_EXPIRED);
        }
    }

    // 낙찰 기한이 만료되었는지 검증
    private void validateExpired(final LocalDateTime now) {
        if (this.deadlineAt == null || now.isBefore(this.deadlineAt)) {
            throw new BusinessException(ErrorCode.CANDIDATE_NOT_EXPIRED);
        }
    }
}
