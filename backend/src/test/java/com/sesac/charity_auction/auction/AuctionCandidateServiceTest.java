
package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.auctioncandidate.service.AuctionCandidateService;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.domain.PointType;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class AuctionCandidateServiceTest {

    @Autowired
    private AuctionCandidateService candidateService;

    @Autowired
    private AuctionTestFixture fixture;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private AuctionCandidateRepository candidateRepository;

    @Autowired
    private PointHistoryRepository pointHistoryRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    // 1. 낙찰 수락 테스트
    @Test
    void 낙찰_수락시_경매완료와_포인트적립() {

        // given
        TestData data = createTestData(true, false);

        // when
        candidateService.acceptCandidate(
                data.firstBidderId,
                data.firstCandidateId
        );

        // then
        AuctionCandidate candidate = candidateRepository
                .findById(data.firstCandidateId)
                .orElseThrow();

        Auction auction = auctionRepository
                .findById(data.auctionId)
                .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.COMPLETED,
                candidate.getStatus()
        );

        assertEquals(
                AuctionStatus.COMPLETED,
                auction.getStatus()
        );

        // 10,000원의 50%인 5,000P 적립
        assertEquals(
                1,
                pointHistoryRepository
                        .countByUserIdAndAuctionIdAndPointType(
                                data.firstBidderId,
                                data.auctionId,
                                PointType.EARN
                        )
        );

        PointHistory history = pointHistoryRepository
                .findFirstByUser_IdAndAuction_IdAndPointType(
                        data.firstBidderId,
                        data.auctionId,
                        PointType.EARN
                )
                .orElseThrow();

        assertEquals(5000L, history.getPointAmount());

        // 나머지 후보자는 낙찰 기회를 받지 못함
        AuctionCandidate nextCandidate = candidateRepository
                .findById(data.secondCandidateId)
                .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.NOT_SELECTED,
                nextCandidate.getStatus()
        );
    }

    // 2. 낙찰 거절 테스트
    @Test
    void 낙찰_거절시_다음_후보자에게_기회_부여() {

        // given
        TestData data = createTestData(true, false);

        // when
        candidateService.rejectCandidate(
                data.firstBidderId,
                data.firstCandidateId
        );

        // then
        AuctionCandidate firstCandidate = candidateRepository
                .findById(data.firstCandidateId)
                .orElseThrow();

        AuctionCandidate secondCandidate = candidateRepository
                .findById(data.secondCandidateId)
                .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.REJECTED,
                firstCandidate.getStatus()
        );

        assertEquals(
                AuctionCandidateStatus.OFFERED,
                secondCandidate.getStatus()
        );

        assertEquals(
                AuctionStatus.CLOSED,
                auctionRepository.findById(data.auctionId)
                        .orElseThrow()
                        .getStatus()
        );
    }

    // 3. 낙찰 기한 만료 테스트
    @Test
    void 낙찰_기한_만료시_다음_후보자에게_기회_부여() {

        // given
        TestData data = createTestData(true, true);

        // when
        candidateService.processExpiredCandidate(data.auctionId);

        // then
        AuctionCandidate firstCandidate = candidateRepository
                .findById(data.firstCandidateId)
                .orElseThrow();

        AuctionCandidate secondCandidate = candidateRepository
                .findById(data.secondCandidateId)
                .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.EXPIRED,
                firstCandidate.getStatus()
        );

        assertEquals(
                AuctionCandidateStatus.OFFERED,
                secondCandidate.getStatus()
        );
    }

    // 4. 마지막 후보자 거절시 유찰 테스트
    @Test
    void 마지막_후보자_거절시_경매_유찰() {

        // given
        TestData data = createTestData(false, false);

        // when
        candidateService.rejectCandidate(
                data.firstBidderId,
                data.firstCandidateId
        );

        // then
        AuctionCandidate candidate = candidateRepository
                .findById(data.firstCandidateId)
                .orElseThrow();

        Auction auction = auctionRepository
                .findById(data.auctionId)
                .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.REJECTED,
                candidate.getStatus()
        );

        assertEquals(
                AuctionStatus.FAILED,
                auction.getStatus()
        );
    }

    // 5. 테스트 데이터 생성
    private TestData createTestData(
            boolean createSecondCandidate,
            boolean expired
    ) {

        // 사용자 생성
        User seller = fixture.createUser();
        User firstBidder = fixture.createUser();

        // 종료 시간이 지난 진행 중 경매 생성
        Auction auction = fixture.createExpiredAuction(seller);

        // 첫 번째 입찰
        Bid firstBid = fixture.createBid(
                firstBidder,
                auction,
                10000L
        );

        // 첫 번째 후보 생성
        AuctionCandidate firstCandidate =
                candidateRepository.save(
                        AuctionCandidate.create(
                                auction,
                                firstBidder,
                                firstBid,
                                1L,
                                10000L
                        )
                );

        User secondBidder = null;
        AuctionCandidate secondCandidate = null;

        // 두 번째 후보 생성 (필요한 테스트만)
        if (createSecondCandidate) {

            secondBidder = fixture.createUser();

            Bid secondBid = fixture.createBid(
                    secondBidder,
                    auction,
                    9000L
            );

            secondCandidate = candidateRepository.save(
                    AuctionCandidate.create(
                            auction,
                            secondBidder,
                            secondBid,
                            2L,
                            9000L
                    )
            );
        }

        Long auctionId = auction.getId();
        Long firstCandidateId = firstCandidate.getId();

        Long secondCandidateId = secondCandidate != null
                ? secondCandidate.getId()
                : null;

        Long firstBidderId = firstBidder.getId();

        // 경매 마감 및 첫 번째 후보자에게 낙찰 기회 부여
        transactionTemplate.executeWithoutResult(status -> {

            Auction savedAuction = auctionRepository
                    .findByIdWithLock(auctionId)
                    .orElseThrow();

            AuctionCandidate savedCandidate = candidateRepository
                    .findByIdWithLock(firstCandidateId)
                    .orElseThrow();

            LocalDateTime now = LocalDateTime.now();

            // 경매 마감
            savedAuction.close(now);

            if (expired) {
                // 이미 낙찰 기한이 만료된 상태로 설정
                savedCandidate.offer(
                        now.minusMinutes(2),
                        now.minusMinutes(1)
                );
            } else {
                // 정상적인 낙찰 기회 부여
                savedCandidate.offer(
                        now,
                        now.plusMinutes(30)
                );
            }
        });

        return new TestData(
                auctionId,
                firstBidderId,
                firstCandidateId,
                secondCandidateId
        );
    }

    // 테스트 데이터 ID 보관
    private record TestData(
            Long auctionId,
            Long firstBidderId,
            Long firstCandidateId,
            Long secondCandidateId
    ) {}
}