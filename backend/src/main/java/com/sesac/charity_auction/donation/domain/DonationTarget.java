package com.sesac.charity_auction.donation.domain;

import jakarta.persistence.*;
import lombok.Getter;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Getter
@Entity
@Table(name = "donation_targets")
public class DonationTarget {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "target_id")
    private Long id;

    @Column(name = "target_name", nullable = false, length = 100)
    private String targetName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "target_image", length = 500)
    private String targetImage;

    @Column(name = "is_active", nullable = false)
    private boolean active;

    // 누적액 변경은 조건부 UPDATE 쿼리로만 해요(6단계).
    @Column(name = "total_donation", nullable = false)
    private long totalDonation;

    @Column(name = "target_amount", nullable = false)
    private long targetAmount;

    // 누적액이 목표 이상이 되면 기부 처리(addDonation 쿼리)에서 true로 바꿔요.
    @Column(name = "is_achieved", nullable = false)
    private boolean achieved;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected DonationTarget() {
    }

    public DonationTarget(final String targetName, final String description, final String targetImage, final long targetAmount) {
        this.targetName = targetName;
        this.description = description;
        this.targetImage = targetImage;
        this.targetAmount = targetAmount;
        this.active = true;
        this.totalDonation = 0L;
        this.achieved = false;
    }

    public void changeImage(final String targetImage) {
        this.targetImage = targetImage;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }
}
