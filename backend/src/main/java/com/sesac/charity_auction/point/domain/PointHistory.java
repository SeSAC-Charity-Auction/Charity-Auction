package com.sesac.charity_auction.point.domain;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.donation.domain.Donation;
import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

/**
 * 포인트 장부. 잔액 자체는 users.point_balance에 있어요.
 */
@Getter
@Entity
@Table(name = "point_histories")
public class PointHistory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id")
    private Long id;


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id")
    private Auction auction;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "donation_id")
    private Donation donation;

    @Column(name = "point_amount", nullable = false)
    private long pointAmount;

    @Enumerated(EnumType.STRING)
    @Column(name = "point_type", nullable = false, length = 20)
    private PointType pointType;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected PointHistory() {
    }

    /**
     * 기부로 포인트를 쓴 기록
     */
    public static PointHistory usedForDonation(final User user, final Donation donation, final long amount) {
        final PointHistory history = new PointHistory();
        history.user = user;
        history.donation = donation;
        history.pointAmount = amount;
        history.pointType = PointType.USE;
        return history;
    }

    // 경매 낙찰 포인트 적립 기록
    public static PointHistory earnedForAuction(final User user, final Auction auction, final long amount){

        final PointHistory history = new PointHistory();

        history.user = user;
        history.auction = auction;
        history.pointAmount = amount;
        history.pointType = PointType.EARN;

        return history;
    }


    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
