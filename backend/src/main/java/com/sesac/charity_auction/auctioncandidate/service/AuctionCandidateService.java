package com.sesac.charity_auction.auctioncandidate.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.dto.MyOfferedCandidateResponse;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional(readOnly = true)
@RequiredArgsConstructor
public class AuctionCandidateService {

    private final AuctionRepository auctionRepository;
    private final AuctionCandidateRepository auctionCandidateRepository;
    private static final int OFFER_MINUTES = 1; // 임시로 1분

    // 낙찰 기한 만료 및 다음 후보자 선정
    @Transactional
    public void processExpiredCandidate(Long auctionId){

        // 경매 조회(+ 비관적 락)
        Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(()-> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 경매 마감 확인
        if(auction.getStatus() != AuctionStatus.CLOSED){
            throw new BusinessException(ErrorCode.AUCTION_NOT_CLOSED);
        }
        // 현재 후보자 조회
        AuctionCandidate currentCandidate = auctionCandidateRepository
                .findByAuction_IdAndStatus(auctionId, AuctionCandidateStatus.OFFERED)
                .orElseThrow(()-> new BusinessException(ErrorCode.CANDIDATE_NOT_OFFERED));

        // 응답 기한 확인
        LocalDateTime now = LocalDateTime.now();

        if(currentCandidate.getDeadlineAt() == null || currentCandidate.getDeadlineAt().isAfter(now)){
            return;
        }

        // 후보자 만료 처리
        currentCandidate.expire();

        // 다음 후보자 조회
        Optional<AuctionCandidate> nextCandidate = auctionCandidateRepository
                .findFirstByAuctionIdAndStatusOrderByRankAsc(auctionId, AuctionCandidateStatus.WAITING);

        // 후보자가 없을 경우 유찰 처리
        if(nextCandidate.isEmpty()){
            auction.fail();
            return;
        }

        // 다음 후보자에게 기회 부여
        AuctionCandidate candidate = nextCandidate.get();

        candidate.offer(now.plusMinutes(OFFER_MINUTES));
    }

    // 유저 낙찰 기회 내역 상태별 조건 조회
    public List<MyOfferedCandidateResponse> getMyOfferedCandidate(Long userId, AuctionCandidateStatus status){

        List<AuctionCandidate> candidates = auctionCandidateRepository.findAllByUser_IdAndStatusOrderByIdDesc(userId, status);

        return candidates.stream()
                .map(candidate -> new MyOfferedCandidateResponse(
                        candidate.getAuction().getId(),
                        candidate.getAuction().getTitle(),
                        candidate.getBidPrice(),
                        candidate.getRank(),
                        candidate.getStatus(),
                        candidate.getOfferedAt(),
                        candidate.getDeadlineAt(),
                        candidate.getCompletedAt()
                ))
                .toList();
    }

    // 유저 낙찰 기회 내역 전체 조회
    public List <MyOfferedCandidateResponse> getAllMyOfferedCandidate(Long userId){

        List <AuctionCandidate> candidates = auctionCandidateRepository.findAllByUser_IdOrderByIdDesc(userId);

        return candidates.stream()
                .map(candidate -> new MyOfferedCandidateResponse(
                        candidate.getAuction().getId(),
                        candidate.getAuction().getTitle(),
                        candidate.getBidPrice(),
                        candidate.getRank(),
                        candidate.getStatus(),
                        candidate.getOfferedAt(),
                        candidate.getDeadlineAt(),
                        candidate.getCompletedAt()
                ))
                .toList();
    }
}
