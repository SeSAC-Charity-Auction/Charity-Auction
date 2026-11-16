package com.sesac.charity_auction.scheduler;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.auctioncandidate.service.AuctionCandidateService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionCandidateScheduler {

    private final AuctionRepository auctionRepository;
    private final AuctionCandidateRepository auctionCandidateRepository;
    private final AuctionCandidateService auctionCandidateService;

    // 10초마다 실행
    @Scheduled(fixedDelay = 10000)
    public void processExpiredCandidates(){

        // 마감 상태인 경매 중에서 낙찰 기한이 만료된 후보자가 있는 경매 조회
        List<Long> auctionIds = auctionCandidateRepository.findExpiredCandidateAuctionIds(
                AuctionCandidateStatus.OFFERED, AuctionStatus.CLOSED, LocalDateTime.now()
        );

        for(Long auctionId : auctionIds){
            try {
                auctionCandidateService.processExpiredCandidate(auctionId);
            }catch (Exception e){
                log.error("낙찰 후보 만료 처리 실패. auctionId: {}", auctionId, e);
            }
        }
    }
}
