package com.sesac.charity_auction.auctioncandidate.dto;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;

import java.time.LocalDateTime;

public record CandidateAcceptResponseDto(
        Long candidateId,
        AuctionCandidateStatus candidateStatus,
        AuctionStatus auctionStatus,
        LocalDateTime now,
        Long pointAmount,
        String message
) {
}
