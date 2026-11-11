package com.sesac.charity_auction.user.entity;

import com.sesac.charity_auction.global.common.BaseTimeEntity;
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

    // 탈퇴 회원의 이메일 및 닉네임 재사용을 위해 일반 UNIQUE 제약조건 대신 Generated Column 기반 UNIQUE 인덱스 사용

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 254)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 10)
    private String nickname;

    @ColumnDefault("0")
    @Column(nullable = false)
    private long point = 0L;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean isDeleted = false;

    @Column(length = 300)
    private String image;

    // 회원가입
    public static User create(String email, String password, String nickname){
        User user = new User();
        user.email = email;
        user.password = password;
        user.nickname = nickname;

        return user;
    }
}
