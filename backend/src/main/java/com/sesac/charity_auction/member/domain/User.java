package com.sesac.charity_auction.member.domain;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.time.ZoneOffset;

@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;

    @Column(name = "login_id", nullable = false, length = 50)
    private String loginId;

    // BCrypt 해시만 저장해요. 원래 비밀번호는 저장하지 않아요.
    @Column(nullable = false, length = 100)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 100)
    private String email;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // 잔액 변경은 조건부 UPDATE 쿼리로만 해요(6단계). setter는 일부러 만들지 않았어요.
    @Column(name = "point_balance", nullable = false)
    private long pointBalance;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    protected User() {
    }

    public User(String loginId, String encodedPassword, String name, String email) {
        this.loginId = loginId;
        this.password = encodedPassword;
        this.name = name;
        this.email = email;
        this.role = Role.USER;
        this.pointBalance = 0L;
    }

    @PrePersist
    void onCreate() {
        this.createdAt = LocalDateTime.now(ZoneOffset.UTC);
    }

    public Long getId() { return id; }
    public String getLoginId() { return loginId; }
    public String getPassword() { return password; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public long getPointBalance() { return pointBalance; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
