package com.sesac.charity_auction.donation.domain;

import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Entity
@Table(name = "donations")
public class Donation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "donation_id")
    private Long id;

    // LAZY: 필요할 때만 조회해서 불필요한 쿼리를 줄여요.
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "target_id", nullable = false)
    private DonationTarget target;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "donation_amount", nullable = false)
    private long donationAmount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected Donation() {
    }

    public Donation(final DonationTarget target, final User user, final long donationAmount) {
        this.target = target;
        this.user = user;
        this.donationAmount = donationAmount;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
