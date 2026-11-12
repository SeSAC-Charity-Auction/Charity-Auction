package com.sesac.charity_auction.point.domain;

import com.sesac.charity_auction.donation.domain.Donation;
import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

/** 포인트 장부. 잔액 자체는 users.point_balance에 있어요. */
@Entity
@Table(name = "point_histories")
public class PointHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "point_id")
    private Long id;

    // 경매 테이블이 아직 없어서 번호만 들고 있어요. 외래키는 V2에서 추가해요.
    @Column(name = "auction_id")
    private Long auctionId;

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

    /** 기부로 포인트를 쓴 기록 */
    public static PointHistory usedForDonation(User user, Donation donation, long amount) {
        PointHistory h = new PointHistory();
        h.user = user;
        h.donation = donation;
        h.pointAmount = amount;
        h.pointType = PointType.USE;
        return h;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public Long getAuctionId() { return auctionId; }
    public User getUser() { return user; }
    public Donation getDonation() { return donation; }
    public long getPointAmount() { return pointAmount; }
    public PointType getPointType() { return pointType; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
