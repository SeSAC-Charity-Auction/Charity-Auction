package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auctioncandidate.domain.AuctionCandidate;
import com.sesac.charity_auction.auctioncandidate.dto.HighestBidDto;
import com.sesac.charity_auction.auctioncandidate.repository.AuctionCandidateRepository;
import com.sesac.charity_auction.bid.entity.Bid;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionService {

    private final AuctionRepository auctionRepository;
    private final AuctionCandidateRepository auctionCandidateRepository;
    private final BidRepository bidRepository;
    private final UserRepository userRepository;
    private static final int temp = 1;  // 임시 설정 1분

    // 경매 마감 후 낙찰 전체 후보 생성
    @Transactional
    public void createCandidates(Long auctionId){

        // 경매 존재 여부 확인
        Auction auction = auctionRepository.findByIdWithLock(auctionId)
                .orElseThrow(()-> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        // 경매 status 확인
        if(auction.getStatus() != AuctionStatus.IN_PROGRESS){
            return;
        }

        // 마감 시간 확인
        if(auction.getEndAt().isAfter(LocalDateTime.now())){
            return;
        }

        List<HighestBidDto> highestBids = bidRepository.findHighestBidsByUser(auctionId);

        // 낙찰 후보가 존재하지 않을 경우
        if(highestBids.isEmpty()){
            auction.fail();
            return;
        }

        List<AuctionCandidate> candidates = new ArrayList<>();

        Long rank = 1L;

        // 낙찰 후보 생성
        for(HighestBidDto dto: highestBids){

            // 해당 ID를 가진 프록시 객체 가지고 오기
            User user = userRepository.getReferenceById(dto.getUserId());
            Bid bid = bidRepository.getReferenceById(dto.getBidId());

            AuctionCandidate candidate = AuctionCandidate.create(auction, user, bid, rank++, dto.getBidPrice());

            candidates.add(candidate);
        }
        auctionCandidateRepository.saveAll(candidates);

        // 경매 상태 마감
        auction.close();

        // 1순위 후보자에게 최초 낙찰 기회 부여
        AuctionCandidate firstCandidate = candidates.get(0);
        firstCandidate.offer(LocalDateTime.now().plusMinutes(temp));
    }

}
