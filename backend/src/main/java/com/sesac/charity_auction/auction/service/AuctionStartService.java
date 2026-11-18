package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuctionStartService {
    private final AuctionRepository auctionRepository;

    @Transactional
    public void start(final Long auctionId) {
        final Auction auction = auctionRepository.findByIdWithLock(auctionId).orElse(null);
        if (auction == null || auction.getStatus() != AuctionStatus.SCHEDULED) {
            return;
        }
        final LocalDateTime now = auctionRepository.findCurrentDatabaseTime();
        if (now.isBefore(auction.getStartAt())) {
            return;
        }
        if (!now.isBefore(auction.getEndAt())) {
            log.warn("기간이 이미 지난 예정 경매라 시작하지 않아요. auctionId: {}", auctionId);
            return;
        }
        auction.start(now);
    }
}
