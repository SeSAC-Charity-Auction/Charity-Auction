
package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;
import com.sesac.charity_auction.category.domain.Category;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import org.springframework.beans.BeanUtils;
import org.springframework.test.util.ReflectionTestUtils;

@Component
@Transactional
public class AuctionTestFixture {

    @PersistenceContext
    private EntityManager entityManager;

    private Category createCategory() {
        Category category = BeanUtils.instantiateClass(Category.class);
        ReflectionTestUtils.setField(category, "name", "테스트-" + UUID.randomUUID().toString().substring(0, 8));
        entityManager.persist(category);
        return category;
    }

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionCandidateRepository candidateRepository;

    public AuctionTestFixture(
            UserRepository userRepository,
            AuctionRepository auctionRepository,
            BidRepository bidRepository,
            AuctionCandidateRepository candidateRepository
    ) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.candidateRepository = candidateRepository;
    }

    // 사용자 생성
    public User createUser() {

        String unique = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 10);

        return userRepository.save(
                User.create(
                        unique + "@test.com",
                        "password",
                        unique,
                        "테스트 사용자"
                )
        );
    }

    // 진행 중인 경매 생성
    public Auction createInProgressAuction(User seller) {

        LocalDateTime now = LocalDateTime.now();

        Auction auction = Auction.create(
                seller,
                createCategory(),
                1000L,
                "테스트 경매",
                now.minusHours(1),
                now.plusHours(1)
        );

        auction.start(now);

        return auctionRepository.save(auction);
    }

    // 마감 시간이 지난 경매 생성
    public Auction createExpiredAuction(User seller) {

        LocalDateTime now = LocalDateTime.now();

        Auction auction = Auction.create(
                seller,
                createCategory(),
                1000L,
                "테스트 경매",
                now.minusDays(2),
                now.minusDays(1)
        );

        // 경매가 진행 중이었던 시점에 시작 처리
        auction.start(now.minusDays(2).plusMinutes(1));

        return auctionRepository.save(auction);
    }


    // 입찰 생성
    public Bid createBid(
            User user,
            Auction auction,
            Long price
    ) {

        Bid bid = Bid.create(user, auction, price, LocalDateTime.now());

        bidRepository.save(bid);

        auction.updateAuctionInfo(price);

        return bid;
    }

    // WAITING 상태 후보 생성
    public AuctionCandidate createWaitingCandidate(
            Auction auction,
            User user,
            Bid bid,
            Long rank,
            Long price
    ) {

        AuctionCandidate candidate = AuctionCandidate.create(
                auction,
                user,
                bid,
                rank,
                price
        );

        return candidateRepository.save(candidate);
    }

    // OFFERED 상태 후보 생성
    public AuctionCandidate createOfferedCandidate(
            Auction auction,
            User user,
            Bid bid,
            Long rank,
            Long price
    ) {

        AuctionCandidate candidate = AuctionCandidate.create(
                auction,
                user,
                bid,
                rank,
                price
        );

        LocalDateTime now = LocalDateTime.now();

        candidate.offer(
                now,
                now.plusMinutes(1)
        );

        return candidateRepository.save(candidate);
    }
}
