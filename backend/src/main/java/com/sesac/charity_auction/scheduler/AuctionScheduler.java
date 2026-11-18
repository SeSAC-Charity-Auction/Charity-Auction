package com.sesac.charity_auction.scheduler;

import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auction.service.AuctionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
@ConditionalOnProperty( // 스케줄러 실행 여부를 설정으로 관리
        name = "scheduler.auction.enabled",
        havingValue = "true"
)
public class AuctionScheduler {
    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;

    // 10초 마다 실행: 시작 시각이 된 예정 경매를 진행 중으로 바꾸고 화면에 알려요.
    @Scheduled(fixedDelay = 10000)
    public void startDueAuctions() {
        final int started = auctionService.startDueAuctions(LocalDateTime.now());
        if (started > 0) {
            log.info("경매 {}건을 시작했어요.", started);
        }
    }

    // 10초 마다 실행
    @Scheduled(fixedDelay = 10000)
    public void closeExpiredAuctions() {

        // 경매 마감 시간이 지난 경매 조회
        final List<Long> auctionIds = auctionRepository.findExpiredAuctionIds(AuctionStatus.IN_PROGRESS, LocalDateTime.now());

        for (final Long auctionId : auctionIds) {
            try {
                // 낙찰 후보 생성
                auctionService.createCandidates(auctionId);
            } catch (final Exception e) {
                log.error("경매 마감 처리 실패. auctionId: {}", auctionId, e);
            }
        }
    }
}