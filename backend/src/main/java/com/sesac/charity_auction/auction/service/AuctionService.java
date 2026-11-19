package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.event.AuctionStatusChangedEvent;
import com.sesac.charity_auction.auction.event.AuctionStatusChangedEvent.Reason;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.dto.HighestBidDto;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionService {
    private static final int OFFER_MINUTES = 5;  // 임시 설정 5분
    private final AuctionRepository auctionRepository;
    private final AuctionCandidateRepository auctionCandidateRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    // 시작 예정 -> 진행 경매
    @Transactional
    public int startDueAuctions(final LocalDateTime now) {
        final List<Long> auctionIds = auctionRepository.findDueAuctionIds(now);
        if (auctionIds.isEmpty()) {
            return 0;
        }
        final int started = auctionRepository.startAuctions(auctionIds);
        auctionIds.forEach(id -> eventPublisher.publishEvent(
                new AuctionStatusChangedEvent(id, AuctionStatus.IN_PROGRESS, Reason.STARTED)));
        return started;
    }

    // 경매 마감 후 낙찰 전체 후보 생성
    @Transactional
    public void createCandidates(final Long auctionId) {
        // 경매 존재 여부 확인
        final Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 경매 status 확인
        if (auction.getStatus() != AuctionStatus.IN_PROGRESS) {
            return;
        }

        // 마감 시간 확인
        final LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        if (auction.getEndAt().isAfter(now)) {
            return;
        }

        final List<HighestBidDto> highestBids = bidRepository.findHighestBidsByUser(auctionId);

        // 경매 마감
        auction.close(now);

        // 입찰자가 없는 경우 유찰
        if (highestBids.isEmpty()) {
            auction.fail();
            eventPublisher.publishEvent(new AuctionStatusChangedEvent(auctionId, AuctionStatus.FAILED, Reason.FAILED));
            return;
        }

        // 낙찰 후보 생성
        final List<AuctionCandidate> candidates = new ArrayList<>();

        long rank = 1L;

        for (final HighestBidDto dto : highestBids) {
            // 후보를 저장할 때 User와 Bid의 “ID(외래 키)”만 필요하고, 그 안의 데이터는 필요 없기 때문에 해당 ID를 가진 프록시 객체로 가지고 오기
            final User user = userRepository.getReferenceById(dto.getUserId());
            final Bid bid = bidRepository.getReferenceById(dto.getBidId());

            final AuctionCandidate candidate = AuctionCandidate.create(auction, user, bid, rank++, dto.getBidPrice());

            candidates.add(candidate);
        }
        auctionCandidateRepository.saveAll(candidates);

        // 1순위 후보자에게 최초 낙찰 기회 부여
        final AuctionCandidate firstCandidate = candidates.getFirst();
        firstCandidate.offer(now, now.plusMinutes(OFFER_MINUTES));

        eventPublisher.publishEvent(new AuctionStatusChangedEvent(auctionId, AuctionStatus.CLOSED, Reason.CLOSED));
    }
}