package com.sesac.charity_auction.auctioncandidate.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidateStatus;
import com.sesac.charity_auction.auctioncandidate.dto.CandidateAcceptResponseDto;
import com.sesac.charity_auction.auctioncandidate.dto.CandidateRejectResponseDto;
import com.sesac.charity_auction.auctioncandidate.dto.MyOfferedCandidateResponse;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.global.common.LocalTimes;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
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
    private final UserRepository userRepository;
    private final PointHistoryRepository pointHistoryRepository;
    private static final int OFFER_MINUTES = 1; // 임시로 1분

    // 낙찰 기한 만료 처리
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
        LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        // 후보자 만료 처리
        currentCandidate.expire(now);

        // 다음 후보자에게 기회 부여
        offerNextCandidate(auction, now);
    }

    // 다음 후보자 선정 (만료/거절시 호출)
    private void offerNextCandidate(Auction auction, LocalDateTime now){

        // 다음 후보자 조회
        Optional<AuctionCandidate> nextCandidate = auctionCandidateRepository
                .findFirstByAuctionIdAndStatusOrderByRankAsc(auction.getId(), AuctionCandidateStatus.WAITING);

        // 후보자가 없을 경우 유찰 처리
        if(nextCandidate.isEmpty()){
            auction.fail();
            return;
        }

        // 다음 후보자에게 기회 부여
        AuctionCandidate candidate = nextCandidate.get();

        candidate.offer(now, now.plusMinutes(OFFER_MINUTES));
    }

    // 낙찰 거절
    @Transactional
    public CandidateRejectResponseDto rejectCandidate(Long userId, Long candidateId){

        // 후보자가 속한 경매 ID 조회 (락X)
        Long auctionId = auctionCandidateRepository
                .findAuctionIdByCandidateId(candidateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CANDIDATE_NOT_FOUND));

        // 경매 락 획득
        Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(()-> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 후보자 락 획득
        AuctionCandidate currentCandidate = auctionCandidateRepository
                .findByIdWithLock(candidateId)
                .orElseThrow(()-> new BusinessException(ErrorCode.CANDIDATE_NOT_FOUND));

        // 본인 확인
        if(!currentCandidate.getUser().getId().equals(userId)){
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 경매 상태 확인
        if(auction.getStatus() != AuctionStatus.CLOSED){
            throw new BusinessException(ErrorCode.AUCTION_NOT_AVAILABLE_FOR_REJECT);
        }

        LocalDateTime now = auctionRepository.findCurrentDatabaseTime();
        // 거절 처리
        currentCandidate.reject(now);

        // 다음 후보자에게 기회 부여
        offerNextCandidate(auction, now);

        return new CandidateRejectResponseDto(candidateId, currentCandidate.getStatus(), auction.getStatus(), LocalDateTime.now(), "낙찰이 거절되었습니다.");
    }

    // 낙찰 수락
    @Transactional
    public CandidateAcceptResponseDto acceptCandidate(Long userId, Long candidateId){

        // 후보자가 속한 경매 ID 조회 (락X)
        Long auctionId = auctionCandidateRepository
                .findAuctionIdByCandidateId(candidateId)
                .orElseThrow(() -> new BusinessException(ErrorCode.CANDIDATE_NOT_FOUND));

        // 경매 락 획득
        Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(()-> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 후보자 락 획득
        AuctionCandidate currentCandidate = auctionCandidateRepository
                .findByIdWithLock(candidateId)
                .orElseThrow(()-> new BusinessException(ErrorCode.CANDIDATE_NOT_FOUND));

        // 본인 확인
        if(!currentCandidate.getUser().getId().equals(userId)){
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        // 경매 상태 확인
        if(auction.getStatus() != AuctionStatus.CLOSED){
            throw new BusinessException(ErrorCode.AUCTION_NOT_AVAILABLE_FOR_ACCEPT);
        }

        // 사용자 조회
        User user = userRepository.findById(userId)
                .orElseThrow(()-> new BusinessException(ErrorCode.USER_NOT_FOUND));

        // 낙찰 완료
        LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        currentCandidate.complete(now);
        auction.complete();

        // 나머지 대기 후보자 기회 종료
        List<AuctionCandidate> waitingCandidates = auctionCandidateRepository.findAllByAuction_IdAndStatus(auctionId, AuctionCandidateStatus.WAITING);
        waitingCandidates.forEach(candidate -> candidate.notSelected(now));

        // 포인트 지급: 낙찰가를 반으로 나눠 낙찰자(구매자)와 판매자에게 각각 돌아가요.
        // 판매자 몫은 "낙찰가 - 구매자 몫"으로 해서, 홀수 금액이어도 한 푼도 사라지지 않게 해요.
        Long pointAmount = currentCandidate.getBidPrice()/2;
        long sellerPointAmount = currentCandidate.getBidPrice() - pointAmount;

        PointHistory pointHistory = PointHistory.earnedForAuction(user, auction, pointAmount);
        pointHistoryRepository.save(pointHistory);

        // 판매자가 탈퇴했으면 지급하지 않아요.
        User seller = auction.getUser();
        Long sellerId = seller.getId();
        boolean payToSeller = !seller.isDeleted() && sellerPointAmount > 0;
        if (payToSeller) {
            pointHistoryRepository.save(PointHistory.earnedForAuction(seller, auction, sellerPointAmount));
        }

        // 장부(point_histories)만 쓰면 잔액이 늘지 않아서, 잔액(users.point_balance)도 함께 올려요.
        // (이 쿼리는 앞의 변경을 먼저 DB에 반영한 뒤 영속성 컨텍스트를 비워요. 그래서 맨 마지막에 둬요.)
        userRepository.addBalance(userId, pointAmount);
        if (payToSeller) {
            userRepository.addBalance(sellerId, sellerPointAmount);
        }

        return new CandidateAcceptResponseDto(candidateId, currentCandidate.getStatus(), auction.getStatus(), now, pointAmount, "포인트 적립이 완료되었습니다.");
    }

    // 유저 낙찰 기회 내역 상태별 조건 조회
    public List<MyOfferedCandidateResponse> getMyOfferedCandidate(Long userId, AuctionCandidateStatus status){

        List<AuctionCandidate> candidates = auctionCandidateRepository.findAllByUser_IdAndStatusOrderByIdDesc(userId, status);

        return candidates.stream()
                .map(candidate -> new MyOfferedCandidateResponse(
                        candidate.getId(),
                        candidate.getAuction().getId(),
                        candidate.getAuction().getTitle(),
                        candidate.getBidPrice(),
                        candidate.getRank(),
                        candidate.getStatus(),
                        candidate.getOfferedAt(),
                        candidate.getDeadlineAt(),
                        candidate.getProcessedAt(),
                        candidate.getDeadlineAt() == null ? null : LocalTimes.toIsoInstant(candidate.getDeadlineAt())
                ))
                .toList();
    }

    // 유저 낙찰 기회 내역 전체 조회
    public List <MyOfferedCandidateResponse> getAllMyOfferedCandidate(Long userId){

        List <AuctionCandidate> candidates = auctionCandidateRepository.findAllByUser_IdOrderByIdDesc(userId);

        return candidates.stream()
                .map(candidate -> new MyOfferedCandidateResponse(
                        candidate.getId(),
                        candidate.getAuction().getId(),
                        candidate.getAuction().getTitle(),
                        candidate.getBidPrice(),
                        candidate.getRank(),
                        candidate.getStatus(),
                        candidate.getOfferedAt(),
                        candidate.getDeadlineAt(),
                        candidate.getProcessedAt(),
                        candidate.getDeadlineAt() == null ? null : LocalTimes.toIsoInstant(candidate.getDeadlineAt())
                ))
                .toList();
    }
}
