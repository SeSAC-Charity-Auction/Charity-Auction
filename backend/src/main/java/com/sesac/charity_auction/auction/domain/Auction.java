package com.sesac.charity_auction.auction.domain;

import com.sesac.charity_auction.global.common.BaseTimeEntity;
import com.sesac.charity_auction.user.entity.User;
import jakarta.persistence.*;
import lombok.AccessLevel;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.ColumnDefault;

import java.time.LocalDateTime;

@Entity
@Table(name = "auctions")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class Auction extends BaseTimeEntity {

    @Id
    @Column(name = "auction_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String title;

    @Column(length = 500)
    private String image;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private Long startPrice;

    @Column(nullable = false)
    private Long currentPrice;

    @ColumnDefault("0")
    @Column(nullable = false)
    private Long bidCount = 0L;

    @Column(nullable = false)
    private LocalDateTime startAt;

    @Column(nullable = false)
    private LocalDateTime endAt;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AuctionStatus status;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 경매 생성시 현재 가격을 시작 가격으로 초기화할 것
    public static Auction create(User user, Long startPrice){

        Auction auction = new Auction();
        auction.user = user;
        auction.startPrice = startPrice;
        auction.currentPrice = startPrice;

        return auction;
    }

    // 입찰시 경매 정보 업데이트
    public void updateAuctionInfo(Long bidPrice){
        this.currentPrice = bidPrice;
        this.bidCount++;
    }

    // 경매 상태 변경
    public void close(){
        this.status = AuctionStatus.CLOSED;
    }

    public void complete(){
        this.status = AuctionStatus.COMPLETED;
    }

    public void fail(){
        this.status = AuctionStatus.FAILED;
    }

    public void cancel(){
        this.status = AuctionStatus.CANCELED;
    }

}
