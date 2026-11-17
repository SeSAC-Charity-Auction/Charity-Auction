package com.sesac.charity_auction.auction.domain;

import com.sesac.charity_auction.category.domain.Category;
import com.sesac.charity_auction.global.common.BaseTimeEntity;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
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
    private AuctionStatus status = AuctionStatus.SCHEDULED;

    @ColumnDefault("false")
    @Column(nullable = false)
    private boolean isDeleted = false;

    private LocalDateTime deletedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id", nullable = false)
    private Category category;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // 경매 생성시 현재 가격을 시작 가격으로 초기화할 것
    public static Auction create(User user, Category category ,Long startPrice, String title, LocalDateTime startAt, LocalDateTime endAt){

        Auction auction = new Auction();
        auction.user = user;
        auction.category = category;
        auction.title = title;
        auction.startPrice = startPrice;
        auction.currentPrice = startPrice;
        auction.startAt = startAt;
        auction.endAt = endAt;

        return auction;
    }

    // 입찰시 경매 정보 업데이트
    public void updateAuctionInfo(Long bidPrice){
        this.currentPrice = bidPrice;
        this.bidCount++;
    }

    // 경매 마감
    public void close(LocalDateTime now){
        validateStatus(AuctionStatus.IN_PROGRESS, ErrorCode.AUCTION_NOT_IN_PROGRESS);
        validateEndTime(now);
        this.status = AuctionStatus.CLOSED;
    }

    // 낙찰 완료
    public void complete(){
        validateStatus(AuctionStatus.CLOSED, ErrorCode.AUCTION_NOT_CLOSED);
        this.status = AuctionStatus.COMPLETED;
    }

    // 유찰
    public void fail(){

        validateStatus(AuctionStatus.CLOSED, ErrorCode.AUCTION_NOT_CLOSED);
        this.status = AuctionStatus.FAILED;
    }

    // 경매 취소
    public void cancel(LocalDateTime now){
        validateStatus(AuctionStatus.SCHEDULED, ErrorCode.AUCTION_NOT_SCHEDULED);

        // 경매 시작 시간이 다 되었는데 스케줄러가 아직 실행되지 않아 DB 상태가 여전히 SCHEDULED인 경우
        if(!now.isBefore(this.startAt)){
            throw new BusinessException(ErrorCode.AUCTION_ALREADY_STARTED);
        }

        // 입찰 내역이 있는지 확인
        if(this.bidCount > 0){
            throw new BusinessException(ErrorCode.AUCTION_HAS_BIDS);
        }

        this.status = AuctionStatus.CANCELED;
    }

    // 상태 검증
    private void validateStatus(AuctionStatus expectedStatus, ErrorCode errorCode){

        if(this.status != expectedStatus){
            throw new BusinessException(errorCode);
        }
    }

    // 기한 검증
    private void validateEndTime(LocalDateTime now){

        if(this.endAt == null || now.isBefore(this.endAt)){
            throw new BusinessException(ErrorCode.AUCTION_NOT_ENDED);
        }
    }

    // 경매 시작 (테스트 데이터 생성용)
    public void start(LocalDateTime now) {
        validateStatus(AuctionStatus.SCHEDULED,
                ErrorCode.AUCTION_NOT_SCHEDULED);

        if (now.isBefore(this.startAt)) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_STARTED);
        }

        if (!now.isBefore(this.endAt)) {
            throw new BusinessException(ErrorCode.AUCTION_ALREADY_ENDED);
        }

        this.status = AuctionStatus.IN_PROGRESS;
    }

}
