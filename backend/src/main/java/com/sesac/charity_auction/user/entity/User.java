package com.sesac.charity_auction.user.entity;

import com.sesac.charity_auction.global.common.BaseTimeEntity;
import com.sesac.charity_auction.member.domain.Role;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseTimeEntity {
    // 잔액 변경은 조건부 UPDATE 쿼리로만 해요(6단계). setter는 일부러 만들지 않았어요.
    @ColumnDefault("0")
    @Column(name = "point_balance", nullable = false)
    private final long pointBalance = 0L;
    // 탈퇴 회원의 이메일 및 닉네임 재사용을 위해 일반 UNIQUE 제약조건 대신 Generated Column 기반 UNIQUE 인덱스 사용
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "user_id")
    private Long id;
    @Column(nullable = false, length = 254)
    private String email;
    @Column(nullable = false)
    private String password;
    @Column(nullable = false, length = 10)
    private String nickname;
    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean isDeleted = false;
    @Column(length = 300)
    private String image;
    @Column(nullable = false, length = 50)
    private String name;
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Role role;

    // 회원가입
    public static User create(String email, String password, String nickname, String name) {
        final User user = new User();
        user.email = email;
        user.password = password;
        user.nickname = nickname;
        user.role = Role.USER;
        user.name = name;
        return user;
    }

    /**
     * 개인정보 보호용: 첫 글자만 보이고 나머지는 가려요. (예: 김민준 -> 김**)
     */
    public String getMaskedName() {
        if (name == null || name.isEmpty()) {
            return "**";
        }
        return name.charAt(0) + "**";
    }
}
