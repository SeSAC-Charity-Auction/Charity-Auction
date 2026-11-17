
package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.service.AuctionService;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.user.entity.User;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@Transactional
class AuctionServiceTest {

    @Autowired
    private AuctionService auctionService;

    @Autowired
    private AuctionTestFixture fixture;

    @Autowired
    private AuctionCandidateRepository candidateRepository;


    @Test
    void 동일한_사용자가_여러번_입찰해도_최고_금액만_후보로_생성된다() {

        // given
        User seller = fixture.createUser();
        User user1 = fixture.createUser();
        User user2 = fixture.createUser();

        Auction auction = fixture.createExpiredAuction(seller);

        // user1은 두 번 입찰
        fixture.createBid(user1, auction, 10000L);
        fixture.createBid(user1, auction, 15000L);

        // user2는 한 번 입찰
        fixture.createBid(user2, auction, 20000L);

        // when
        auctionService.createCandidates(auction.getId());

        // then
        List<AuctionCandidate> candidates =
                candidateRepository.findAllByAuction_IdOrderByRankAsc(
                        auction.getId()
                );

        // 사용자별 최고 입찰 금액만 후보로 생성
        assertEquals(2, candidates.size());

        // 1순위: user2
        assertEquals(user2.getId(), candidates.get(0).getUser().getId());
        assertEquals(20000L, candidates.get(0).getBidPrice());
        assertEquals(1L, candidates.get(0).getRank());

        // 2순위: user1의 최고 입찰 금액
        assertEquals(user1.getId(), candidates.get(1).getUser().getId());
        assertEquals(15000L, candidates.get(1).getBidPrice());
        assertEquals(2L, candidates.get(1).getRank());

        // 첫 번째 후보자에게 낙찰 기회 부여
        assertEquals(
                AuctionCandidateStatus.OFFERED,
                candidates.get(0).getStatus()
        );

        assertEquals(
                AuctionCandidateStatus.WAITING,
                candidates.get(1).getStatus()
        );

        assertEquals(AuctionStatus.CLOSED, auction.getStatus());
    }


    @Test
    void 입찰_금액이_높은_순서대로_후보_순위가_생성된다() {

        // given
        User seller = fixture.createUser();
        User user1 = fixture.createUser();
        User user2 = fixture.createUser();
        User user3 = fixture.createUser();

        Auction auction = fixture.createExpiredAuction(seller);

        fixture.createBid(user1, auction, 10000L);
        fixture.createBid(user2, auction, 30000L);
        fixture.createBid(user3, auction, 20000L);

        // when
        auctionService.createCandidates(auction.getId());

        // then
        List<AuctionCandidate> candidates =
                candidateRepository.findAllByAuction_IdOrderByRankAsc(
                        auction.getId()
                );

        assertEquals(3, candidates.size());

        // 1순위: 30,000원
        assertEquals(1L, candidates.get(0).getRank());
        assertEquals(30000L, candidates.get(0).getBidPrice());
        assertEquals(user2.getId(), candidates.get(0).getUser().getId());

        // 2순위: 20,000원
        assertEquals(2L, candidates.get(1).getRank());
        assertEquals(20000L, candidates.get(1).getBidPrice());
        assertEquals(user3.getId(), candidates.get(1).getUser().getId());

        // 3순위: 10,000원
        assertEquals(3L, candidates.get(2).getRank());
        assertEquals(10000L, candidates.get(2).getBidPrice());
        assertEquals(user1.getId(), candidates.get(2).getUser().getId());
    }


    @Test
    void 입찰자가_없는_경매는_유찰된다() {

        // given
        User seller = fixture.createUser();

        Auction auction = fixture.createExpiredAuction(seller);

        // when
        auctionService.createCandidates(auction.getId());

        // then
        assertEquals(
                AuctionStatus.FAILED,
                auction.getStatus()
        );

        // 낙찰 후보가 생성되지 않아야 함
        List<AuctionCandidate> candidates =
                candidateRepository.findAllByAuction_IdOrderByRankAsc(
                        auction.getId()
                );

        assertTrue(candidates.isEmpty());
    }
}
