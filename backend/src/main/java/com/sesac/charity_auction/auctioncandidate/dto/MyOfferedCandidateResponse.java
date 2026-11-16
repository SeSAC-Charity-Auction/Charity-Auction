package com.sesac.charity_auction.auctioncandidate.dto;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;

import java.time.LocalDateTime;

public record MyOfferedCandidateResponse(
        Long auctionId,
        String title,
        Long bidPrice,
        Long candidateRank,
        AuctionCandidateStatus status,
        LocalDateTime offeredAt,
        LocalDateTime deadlineAt,
        LocalDateTime processedAt
) {
}
