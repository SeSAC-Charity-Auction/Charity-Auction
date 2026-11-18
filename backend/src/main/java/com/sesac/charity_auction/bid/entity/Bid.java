package com.sesac.charity_auction.bid.entity;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/* 입찰 기능 개발을 위한 초기 엔티티 생성, 추후 타 테이블 관계 매핑 필요 */

@Entity
@Table(name = "bids")
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@Getter
public class Bid {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "bid_id")
    private Long id;

    @Column(nullable = false)
    private Long bidPrice;

    @Column(nullable = false, updatable = false)
    private LocalDateTime bidAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    // 입찰 생성
    public static Bid create(User user, Auction auction, Long bidPrice, LocalDateTime bidAt){

        final Bid bid = new Bid();
        bid.user = user;
        bid.auction = auction;
        bid.bidPrice = bidPrice;
        bid.bidAt = bidAt;

        return bid;
    }

}
