package com.sesac.charity_auction.bid.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.bid.dto.request.BidCreateRequest;
import com.sesac.charity_auction.bid.dto.response.BidCreateResponse;
import com.sesac.charity_auction.bid.dto.response.BidListResponse;
import com.sesac.charity_auction.bid.dto.response.BidRealtimeResponse;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.bid.event.BidCreatedEvent;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class BidService {
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final ApplicationEventPublisher eventPublisher;

    // 특정 경매의 입찰 내역 조회
    public List<BidListResponse> getBidHistory(final Long auctionId) {

        // 경매 존재 여부 확인
        auctionRepository.findById(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        final List<Bid> bids = bidRepository.findTop5ByAuction_IdOrderByBidAtDesc(auctionId);

        return bids.stream()
                .map(BidListResponse::from)
                .toList();
    }

    // 입찰 등록
    @Transactional
    public BidCreateResponse createBid(final Long auctionId, final Long userId, final BidCreateRequest request) {
        final User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 경매 조회 - 비관적 락
        final Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // DB 시간 기준 통일 (반드시 경매 조회 및 락 획득이 완료된 다음에 조회 - 대기X)
        final LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        // 입찰 가능 여부 검증
        validateBid(auction, user, request.bidPrice(), now);

        // 입찰 엔티티 생성 후 내역 저장
        final Bid bid = Bid.create(user, auction, request.bidPrice(), now);
        bidRepository.save(bid);

        // 경매 정보 갱신
        auction.updateAuctionInfo(request.bidPrice());

        // api 응답
        BidCreateResponse response = BidCreateResponse.from(bid, auction.getCurrentPrice(), auction.getBidCount());

        // 웹소켓 실시간 전송 데이터 생성
        BidRealtimeResponse realtimeResponse = BidRealtimeResponse.from(bid, auction);

        // 입찰 성공 이벤트 발생 - 객체 간 이벤트 전달
        eventPublisher.publishEvent(new BidCreatedEvent(auctionId, realtimeResponse));

        return response;
    }

    // 입찰 가능 여부 검증
    private void validateBid(final Auction auction, final User user, final Long bidPrice, final LocalDateTime now) {
        // 본인이 등록한 경매인지 확인
        if (auction.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.BID_NOT_ALLOWED);
        }

        // 경매 시작 전인지 확인
        if (now.isBefore(auction.getStartAt())) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_STARTED);
        }

        // 경매 종료 여부 확인
        if (!now.isBefore(auction.getEndAt())) {
            throw new BusinessException(ErrorCode.AUCTION_ALREADY_ENDED);
        }

        // 경매 상태 확인
        if (auction.getStatus() != AuctionStatus.IN_PROGRESS) {
            throw new BusinessException(ErrorCode.AUCTION_NOT_IN_PROGRESS);
        }

        // 입찰 금액 검증
        if (bidPrice == null || bidPrice <= auction.getCurrentPrice()) {
            throw new BusinessException(ErrorCode.BID_PRICE_TOO_LOW);
        }
    }
}
