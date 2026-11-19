package com.sesac.charity_auction.auctioncandidate.dto;

import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.global.common.LocalTimes;

import java.time.LocalDateTime;

public record MyOfferedCandidateResponse(
        Long candidateId,
        Long auctionId,
        String title,
        String image,          // 경매 이미지 주소 (없으면 null)
        Long bidPrice,
        Long candidateRank,
        AuctionCandidateStatus status,
        LocalDateTime offeredAt,
        LocalDateTime deadlineAt,
        LocalDateTime processedAt,
        String deadlineAtIso,  // 낙찰 기한(UTC 표시가 있는 ISO 8601). 없으면 null
        String processedAtIso  // 수락·포기·만료 등 처리된 시각(UTC ISO 8601). 없으면 null
) {
    public static MyOfferedCandidateResponse from(final AuctionCandidate candidate) {
        return new MyOfferedCandidateResponse(
                candidate.getId(),
                candidate.getAuction().getId(),
                candidate.getAuction().getTitle(),
                candidate.getAuction().getImage(),
                candidate.getBidPrice(),
                candidate.getRank(),
                candidate.getStatus(),
                candidate.getOfferedAt(),
                candidate.getDeadlineAt(),
                candidate.getProcessedAt(),
                candidate.getDeadlineAt() == null ? null : LocalTimes.toIsoInstant(candidate.getDeadlineAt()),
                candidate.getProcessedAt() == null ? null : LocalTimes.toIsoInstant(candidate.getProcessedAt())
        );
    }
}
