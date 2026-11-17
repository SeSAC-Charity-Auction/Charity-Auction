package com.sesac.charity_auction.auction.dto.response;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;

import java.time.LocalDateTime;

public record AuctionDetailResponse(
        Long id,
        String title,
        String image,
        String description,
        Long startPrice,
        Long currentPrice,
        Long bidCount,
        LocalDateTime startAt,
        LocalDateTime endAt,
        AuctionStatus status,
        Long categoryId,
        String categoryName,
        Long userId
) {
    public static AuctionDetailResponse from(Auction auction){
        return new AuctionDetailResponse(
                auction.getId(),
                auction.getTitle(),
                auction.getImage(),
                auction.getDescription(),
                auction.getStartPrice(),
                auction.getCurrentPrice(),
                auction.getBidCount(),
                auction.getStartAt(),
                auction.getEndAt(),
                auction.getStatus(),
                auction.getCategory().getId(),
                auction.getCategory().getName(),
                auction.getUser().getId()

import com.sesac.charity_auction.global.common.LocalTimes;

import java.util.List;

/** 경매 물품 상세예요. 시간은 UTC 표시를 붙인 ISO 8601로 내려줘요. */
public record AuctionDetailResponse(
        long auctionId,
        String title,
        String image,
        String description,
        long categoryId,
        String categoryName,
        String sellerNickname,
        long startPrice,
        long currentPrice,
        long bidCount,
        String startAt,
        String endAt,
        String status,
        AuctionWinnerResponse winner,           // 낙찰이 끝났을 때만 값이 있어요
        List<BidHistoryItemResponse> recentBids // 최신순
) {
    public static AuctionDetailResponse of(final Auction a, final AuctionWinnerResponse winner,
                                           final List<BidHistoryItemResponse> recentBids) {
        return new AuctionDetailResponse(
                a.getId(),
                a.getTitle(),
                a.getImage(),
                a.getDescription(),
                a.getCategory().getId(),
                a.getCategory().getName(),
                a.getUser().getNickname(),
                a.getStartPrice(),
                a.getCurrentPrice(),
                a.getBidCount(),
                LocalTimes.toIsoInstant(a.getStartAt()),
                LocalTimes.toIsoInstant(a.getEndAt()),
                a.getStatus().name(),
                winner,
                recentBids

        );
    }
}
