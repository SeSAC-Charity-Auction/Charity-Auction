package com.sesac.charity_auction.auctioncandidate.dto;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;

import java.time.LocalDateTime;

public record MyOfferedCandidateResponse(
        Long candidateId,
        Long auctionId,
        String title,
        Long bidPrice,
        Long candidateRank,
        AuctionCandidateStatus status,
        LocalDateTime offeredAt,
        LocalDateTime deadlineAt,
        LocalDateTime processedAt,
        String deadlineAtIso // 낙찰 기한(UTC 표시가 있는 ISO 8601). 없으면 null
) {
}
