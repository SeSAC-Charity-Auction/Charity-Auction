package com.sesac.charity_auction.auctioncandidate.domain;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.bid.entity.Bid;
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
@Table(
        name = "auction_candidates",
        uniqueConstraints = {   // 유니크 제약 조건 설정
                @UniqueConstraint(name = "uk_auction_candidate_user", columnNames = {"auction_id", "user_id"}), // 한 경매에서 한 사용자는 하나의 후보로만 등록
                @UniqueConstraint(name = "uk_auction_candidate_bid", columnNames = {"bid_id"}), // 하나의 입찰 내역은 후보 하나에만 연결
                @UniqueConstraint(name = "uk_auction_candidate_rank", columnNames = {"auction_id", "rank"}) // 한 경매에서 후보 순위 중복 방지
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class AuctionCandidate {

    @Id
    @Column(name = "candidate_id")
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "candidate_rank", nullable = false)
    private Long rank;

    @Column(nullable = false)
    private Long bidPrice;

    @Enumerated(EnumType.STRING)
    @ColumnDefault("'WAITING'")
    @Column(nullable = false)
    private AuctionCandidateStatus status = AuctionCandidateStatus.WAITING;

    private LocalDateTime offeredAt;

    private LocalDateTime deadlineAt;

    private LocalDateTime completedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "auction_id", nullable = false)
    private Auction auction;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "bid_id", nullable = false)
    private Bid bid;

    public static AuctionCandidate create(Auction auction, User user, Bid bid, Long rank, Long bidPrice){

        AuctionCandidate auctionCandidate = new AuctionCandidate();

        auctionCandidate.auction = auction;
        auctionCandidate.user = user;
        auctionCandidate.bid= bid;
        auctionCandidate.rank = rank;
        auctionCandidate.bidPrice = bidPrice;

        return auctionCandidate;
    }

    public void offer(LocalDateTime deadlineAt){
        if(this.status !=AuctionCandidateStatus.WAITING){
            throw new BusinessException(ErrorCode.CANDIDATE_NOT_WAITING);
        }
        this.status = AuctionCandidateStatus.OFFERED;
        this.offeredAt = LocalDateTime.now();
        this.deadlineAt = deadlineAt;
    }

    public void complete(){

    }

    public void expire(){
        this.status = AuctionCandidateStatus.EXPIRED;
    }
}
