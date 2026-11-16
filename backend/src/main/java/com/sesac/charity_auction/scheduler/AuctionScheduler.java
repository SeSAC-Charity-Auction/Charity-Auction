package com.sesac.charity_auction.scheduler;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class AuctionScheduler {

    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;

    // 10초 마다 실행
    @Scheduled(fixedDelay = 10000)
    public void closeExpiredAuctions(){

        // 경매 마감 시간이 지난 경매 조회
        List<Long> auctionIds = auctionRepository.findExpiredAuctionIds(AuctionStatus.IN_PROGRESS, LocalDateTime.now());

        for(Long auctionId: auctionIds){
            try {
                // 낙찰 후보 생성
                auctionService.createCandidates(auctionId);
            }catch (Exception e){
                log.error("경매 마감 처리 실패. auctionId: {}", auctionId, e);
            }
        }
    }
}
