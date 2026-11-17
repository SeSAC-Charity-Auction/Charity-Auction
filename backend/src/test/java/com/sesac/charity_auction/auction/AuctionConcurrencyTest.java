package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.auctioncandidate.service.AuctionCandidateService;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.point.domain.PointType;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.entity.User;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.support.TransactionTemplate;

import java.time.LocalDateTime;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;

@SpringBootTest
class AuctionConcurrencyTest {

    @Autowired
    private AuctionCandidateService candidateService;

    @Autowired
    private AuctionTestFixture fixture;

    @Autowired
    private AuctionCandidateRepository candidateRepository;

    @Autowired
    private PointHistoryRepository pointHistoryRepository;

    @Autowired
    private TransactionTemplate transactionTemplate;

    @Autowired
    private AuctionRepository auctionRepository;

    @Test
    void 동일한_후보자에게_동시에_수락_요청() throws Exception {

        // given
        User seller = fixture.createUser();
        User bidder = fixture.createUser();

        Auction auction = fixture.createExpiredAuction(seller);

        Bid bid = fixture.createBid(
                bidder,
                auction,
                10000L
        );

        // 낙찰 후보 생성
        AuctionCandidate candidate =
                fixture.createOfferedCandidate(
                        auction,
                        bidder,
                        bid,
                        1L,
                        10000L
                );

        // 경매 마감
        auction.close(LocalDateTime.now());

        // Fixture의 트랜잭션이 종료되어 데이터가 커밋된 뒤
        // 별도 스레드에서 접근할 수 있도록 준비
        Long userId = bidder.getId();
        Long candidateId = candidate.getId();
        Long auctionId = auction.getId();

        transactionTemplate.executeWithoutResult(status -> {

            Auction savedAuction = auctionRepository
                    .findByIdWithLock(auction.getId())
                    .orElseThrow();

            savedAuction.close(LocalDateTime.now());
        });

        // when
        int threadCount = 20;

        ExecutorService executor =
                Executors.newFixedThreadPool(threadCount);

        CountDownLatch ready =
                new CountDownLatch(threadCount);

        CountDownLatch start =
                new CountDownLatch(1);

        CountDownLatch done =
                new CountDownLatch(threadCount);

        AtomicInteger successCount =
                new AtomicInteger();

        AtomicInteger failureCount =
                new AtomicInteger();

        try {
            for (int i = 0; i < threadCount; i++) {

                executor.submit(() -> {

                    ready.countDown();

                    try {
                        start.await();

                        candidateService.acceptCandidate(
                                userId,
                                candidateId
                        );

                        successCount.incrementAndGet();

                    } catch (Exception e) {
                        failureCount.incrementAndGet();

                    } finally {
                        done.countDown();
                    }
                });
            }

            // 모든 스레드가 준비될 때까지 대기
            ready.await();

            // 동시에 요청 시작
            start.countDown();

            // 모든 작업 완료 대기
            done.await();

        } finally {
            executor.shutdown();
        }

        // then

        // 단 한 번만 낙찰 성공
        assertEquals(1, successCount.get());

        // 나머지 19번은 실패
        assertEquals(19, failureCount.get());

        // 후보자 최종 상태 확인
        AuctionCandidate savedCandidate =
                candidateRepository.findById(candidateId)
                        .orElseThrow();

        assertEquals(
                AuctionCandidateStatus.COMPLETED,
                savedCandidate.getStatus()
        );

        // 경매별 포인트 적립 내역 확인
        long earnCount =
                pointHistoryRepository
                        .countByUserIdAndAuctionIdAndPointType(
                                userId,
                                auctionId,
                                PointType.EARN
                        );

        assertEquals(1, earnCount);
    }
}