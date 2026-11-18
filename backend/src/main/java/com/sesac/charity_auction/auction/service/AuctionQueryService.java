package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.dto.response.*;
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

import java.time.LocalDateTime;
import java.util.List;

/**
 * 경매 물품 목록 조회 전용 서비스예요. 데이터를 바꾸지 않아요.
 */
@Service
@Transactional(readOnly = true)
public class AuctionQueryService {
    private static final int MAX_PAGE_SIZE = 50;
    // 목록 보기 방식. 모르는 값이 오면 전부(ALL)로 봐요.
    private static final List<String> MODES = List.of("IN_PROGRESS", "SCHEDULED", "ENDED");

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

    /**
     * 경매 한 건의 상세예요. 없거나 삭제된 경매는 404(AUCTION_NOT_FOUND)예요.
     */
    public AuctionDetailResponse getDetail(final long auctionId) {
        final Auction auction = auctionRepository.findDetailById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        final List<BidHistoryItemResponse> bids = bidRepository
                .findTop10ByAuction_IdOrderByBidAtDescIdDesc(auctionId).stream()
                .map(BidHistoryItemResponse::from)
                .toList();

        // 낙찰이 끝난 경매(낙찰 후보 중 COMPLETED)가 있으면 낙찰자를 같이 내려줘요.
        final AuctionWinnerResponse winner = candidateRepository
                .findByAuction_IdAndStatus(auctionId, AuctionCandidateStatus.COMPLETED)
                .map(c -> new AuctionWinnerResponse(c.getUser().getNickname(), c.getBidPrice()))
                .orElse(null);

        return AuctionDetailResponse.of(auction, winner, bids);
    }

    /**
     * @param status  IN_PROGRESS(진행 중) / SCHEDULED(예정) / ENDED(마감). 그 밖의 값이나 null이면 전부 (취소·삭제 제외)
     * @param sort    ending(마감 임박, 기본) / latest(최신) / popular(입찰 많은 순) / priceAsc / priceDesc
     * @param keyword 제목 검색어 (비어 있으면 무시)
     */
    public AuctionPageResponse search(final String status, final Long categoryId,
                                      final String keyword, final String sort,
                                      final int page, final int size) {
        final int safePage = Math.max(0, page);
        final int safeSize = Math.clamp(size, 1, MAX_PAGE_SIZE);
        final String q = keyword == null || keyword.isBlank() ? null : keyword.trim();
        final String mode = status != null && MODES.contains(status) ? status : "ALL";

        final Page<Auction> result = auctionRepository.search(
                mode, LocalDateTime.now(), categoryId, q, PageRequest.of(safePage, safeSize, sortOf(sort)));

        return new AuctionPageResponse(
                result.getContent().stream().map(AuctionSummaryResponse::from).toList(),
                safePage, safeSize, result.getTotalElements(), result.getTotalPages());
    }
}
