package com.sesac.charity_auction.donation.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

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

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected DonationTarget() {
    }

    public DonationTarget(String targetName, String description, String targetImage, long targetAmount) {
        this.targetName = targetName;
        this.description = description;
        this.targetImage = targetImage;
        this.targetAmount = targetAmount;
        this.active = true;
        this.totalDonation = 0L;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public String getTargetName() { return targetName; }
    public String getDescription() { return description; }
    public String getTargetImage() { return targetImage; }
    public boolean isActive() { return active; }
    public long getTotalDonation() { return totalDonation; }
    public long getTargetAmount() { return targetAmount; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
