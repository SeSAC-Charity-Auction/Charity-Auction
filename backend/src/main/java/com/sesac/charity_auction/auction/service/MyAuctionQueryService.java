package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.dto.response.MyAuctionPageResponse;
import com.sesac.charity_auction.auction.dto.response.MyAuctionResponse;
import com.sesac.charity_auction.auction.dto.response.MyWinPageResponse;
import com.sesac.charity_auction.auction.dto.response.MyWinResponse;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.global.common.LocalTimes;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/** 마이페이지용 조회예요: 내가 올린 경매, 내 낙찰 이력(과 그 낙찰로 받은 포인트). 데이터를 바꾸지 않아요. */
@Service
@Transactional(readOnly = true)
public class MyAuctionQueryService {
    private static final int MAX_PAGE_SIZE = 50;

    private final AuctionRepository auctionRepository;
    private final AuctionCandidateRepository candidateRepository;
    private final PointHistoryRepository pointHistoryRepository;

    public MyAuctionQueryService(final AuctionRepository auctionRepository,
                                 final AuctionCandidateRepository candidateRepository,
                                 final PointHistoryRepository pointHistoryRepository) {
        this.auctionRepository = auctionRepository;
        this.candidateRepository = candidateRepository;
        this.pointHistoryRepository = pointHistoryRepository;
    }

    /** 내가 올린 경매 (최신 등록순). 각 경매로 받은 판매 포인트와 전체 합계도 같이 내려줘요. */
    public MyAuctionPageResponse getMyAuctions(final long userId, final int page, final int size) {
        final int safePage = Math.max(0, page);
        final int safeSize = clampSize(size);
        final Page<Auction> result = auctionRepository.findMine(userId, PageRequest.of(safePage, safeSize));

        final Map<Long, Long> earned = earnedByAuction(userId,
                result.getContent().stream().map(Auction::getId).toList());
        final List<MyAuctionResponse> items = result.getContent().stream()
                .map(a -> MyAuctionResponse.of(a, earned.getOrDefault(a.getId(), 0L)))
                .toList();

        return new MyAuctionPageResponse(items, safePage, safeSize, result.getTotalElements(),
                result.getTotalPages(), pointHistoryRepository.sumAuctionSold(userId));
    }

    /** 내 낙찰 이력 (낙찰 확정이 최근인 순). 각 낙찰로 받은 포인트와 전체 합계도 같이 내려줘요. */
    public MyWinPageResponse getMyWins(final long userId, final int page, final int size) {
        final int safePage = Math.max(0, page);
        final int safeSize = clampSize(size);
        final Page<AuctionCandidate> result = candidateRepository.findMyResults(
                userId, AuctionCandidateStatus.COMPLETED, PageRequest.of(safePage, safeSize));

        // 이 쪽에 보이는 경매들의 적립 포인트를 한 번에 가져와요.
        final Map<Long, Long> earned = earnedByAuction(userId,
                result.getContent().stream().map(c -> c.getAuction().getId()).toList());

        final List<MyWinResponse> items = result.getContent().stream()
                .map(c -> new MyWinResponse(
                        c.getAuction().getId(),
                        c.getAuction().getTitle(),
                        c.getAuction().getImage(),
                        c.getAuction().getCategory().getName(),
                        c.getBidPrice(),
                        c.getProcessedAt() == null ? null : LocalTimes.toIsoInstant(c.getProcessedAt()),
                        earned.getOrDefault(c.getAuction().getId(), 0L)))
                .toList();

        return new MyWinPageResponse(items, safePage, safeSize, result.getTotalElements(),
                result.getTotalPages(), pointHistoryRepository.sumAuctionEarned(userId));
    }

    // 경매별로 내가 받은 포인트(적립 합계). 보이는 경매들만 한 번에 가져와요.
    private Map<Long, Long> earnedByAuction(final long userId, final List<Long> auctionIds) {
        final Map<Long, Long> earned = new HashMap<>();
        if (auctionIds.isEmpty()) {
            return earned;
        }
        for (final Object[] row : pointHistoryRepository.sumEarnedByAuctions(userId, auctionIds)) {
            earned.put((Long) row[0], ((Number) row[1]).longValue());
        }
        return earned;
    }

    private static int clampSize(final int size) {
        return Math.min(Math.max(1, size), MAX_PAGE_SIZE);
    }
}
