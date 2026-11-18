package com.sesac.charity_auction.scheduler;

import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auction.service.AuctionStartService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@ConditionalOnProperty(name = "scheduler.auction.enabled", havingValue = "true")
public class AuctionStartScheduler {
    private final AuctionRepository auctionRepository;
    private final AuctionStartService auctionStartService;

    @Scheduled(fixedDelay = 10000)
    public void startScheduledAuctions() {
        final LocalDateTime now = auctionRepository.findCurrentDatabaseTime();
        final List<Long> auctionIds = auctionRepository.findStartableAuctionIds(now);
        for (final Long auctionId : auctionIds) {
            try {
                auctionStartService.start(auctionId);
            } catch (final Exception e) {
                log.error("예정 경매 시작 처리 실패. auctionId: {}", auctionId, e);
            }
        }
    }
}
