package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.dto.response.AuctionDetailResponse;
import com.sesac.charity_auction.auction.dto.response.AuctionPageResponse;
import com.sesac.charity_auction.auction.dto.response.AuctionWinnerResponse;
import com.sesac.charity_auction.auction.dto.response.BidHistoryItemResponse;
import com.sesac.charity_auction.auction.dto.response.AuctionSummaryResponse;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/** 경매 물품 목록 조회 전용 서비스예요. 데이터를 바꾸지 않아요. */
@Service
@Transactional(readOnly = true)
public class AuctionQueryService {
    private static final int MAX_PAGE_SIZE = 50;
    // 기본으로는 지금 참여할 수 있거나(진행), 곧 열리는(예정) 경매만 보여줘요.
    private static final List<AuctionStatus> DEFAULT_STATUSES =
            List.of(AuctionStatus.IN_PROGRESS, AuctionStatus.SCHEDULED);

    private final AuctionRepository auctionRepository;
    private final BidRepository bidRepository;
    private final AuctionCandidateRepository candidateRepository;

    public AuctionQueryService(final AuctionRepository auctionRepository,
                               final BidRepository bidRepository,
                               final AuctionCandidateRepository candidateRepository) {
        this.auctionRepository = auctionRepository;
        this.bidRepository = bidRepository;
        this.candidateRepository = candidateRepository;
    }

    /** 경매 한 건의 상세예요. 없거나 삭제된 경매는 404(AUCTION_NOT_FOUND)예요. */
    public AuctionDetailResponse getDetail(final long auctionId) {
        Auction auction = auctionRepository.findDetailById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        List<BidHistoryItemResponse> bids = bidRepository
                .findTop10ByAuction_IdOrderByBidAtDescIdDesc(auctionId).stream()
                .map(BidHistoryItemResponse::from)
                .toList();

        // 낙찰이 끝난 경매(낙찰 후보 중 COMPLETED)가 있으면 낙찰자를 같이 내려줘요.
        AuctionWinnerResponse winner = candidateRepository
                .findByAuction_IdAndStatus(auctionId, AuctionCandidateStatus.COMPLETED)
                .map(c -> new AuctionWinnerResponse(c.getUser().getNickname(), c.getBidPrice()))
                .orElse(null);

        return AuctionDetailResponse.of(auction, winner, bids);
    }

    /**
     * @param status   null이면 진행+예정 경매
     * @param sort     ending(마감 임박, 기본) / latest(최신) / popular(입찰 많은 순) / priceAsc / priceDesc
     * @param keyword  제목 검색어 (비어 있으면 무시)
     */
    public AuctionPageResponse search(final AuctionStatus status, final Long categoryId,
                                      final String keyword, final String sort,
                                      final int page, final int size) {
        int safePage = Math.max(0, page);
        int safeSize = Math.min(Math.max(1, size), MAX_PAGE_SIZE);
        String q = keyword == null || keyword.isBlank() ? null : keyword.trim();
        List<AuctionStatus> statuses = status == null ? DEFAULT_STATUSES : List.of(status);

        Page<Auction> result = auctionRepository.search(
                statuses, categoryId, q, PageRequest.of(safePage, safeSize, sortOf(sort)));

        return new AuctionPageResponse(
                result.getContent().stream().map(AuctionSummaryResponse::from).toList(),
                safePage, safeSize, result.getTotalElements(), result.getTotalPages());
    }

    private static Sort sortOf(final String sort) {
        // 같은 값일 때 순서가 흔들리지 않도록 마지막에 id로 한 번 더 정렬해요.
        Sort byId = Sort.by(Sort.Direction.DESC, "id");
        return switch (sort == null ? "ending" : sort) {
            case "latest" -> Sort.by(Sort.Direction.DESC, "createdAt").and(byId);
            case "popular" -> Sort.by(Sort.Direction.DESC, "bidCount").and(byId);
            case "priceAsc" -> Sort.by(Sort.Direction.ASC, "currentPrice").and(byId);
            case "priceDesc" -> Sort.by(Sort.Direction.DESC, "currentPrice").and(byId);
            default -> Sort.by(Sort.Direction.ASC, "endAt").and(byId);
        };
    }
}
