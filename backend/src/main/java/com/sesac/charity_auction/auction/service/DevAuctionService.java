package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

/**
 * 테스트용으로 경매를 바로 마감해요. local 프로필에서만 만들어져요.
 * 마감 시각을 지금으로 당긴 뒤, 스케줄러가 하는 마감 처리(낙찰 후보 만들기, 1순위에게 낙찰 기회, 입찰이 없으면 유찰)를 곧바로 실행해요.
 */
@Service
@Profile("local")
@RequiredArgsConstructor
public class DevAuctionService {
    private final AuctionRepository auctionRepository;
    private final AuctionService auctionService;

    @Transactional
    public void closeNow(final long auctionId) {
        // 마감 처리는 "마감 시각이 지났는지"를 DB 시간으로 확인해서, 1초 전으로 맞춰요.
        final LocalDateTime past = auctionRepository.findCurrentDatabaseTime().minusSeconds(1);
        if (auctionRepository.expireNow(auctionId, past) == 0) {
            // 바뀐 게 없으면 없는 경매이거나 진행 중이 아닌 경매예요.
            final boolean exists = auctionRepository.findById(auctionId).filter(a -> !a.isDeleted()).isPresent();
            throw new BusinessException(exists ? ErrorCode.AUCTION_NOT_IN_PROGRESS : ErrorCode.AUCTION_NOT_FOUND);
        }
        auctionService.createCandidates(auctionId);
    }
}
