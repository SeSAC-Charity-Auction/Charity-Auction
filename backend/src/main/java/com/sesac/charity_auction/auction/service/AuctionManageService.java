package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.dto.request.AuctionUpdateRequest;
import com.sesac.charity_auction.auction.dto.response.AuctionDetailResponse;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.category.domain.Category;
import com.sesac.charity_auction.category.repository.CategoryRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.DeleteMapping;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class AuctionManageService {

    private final AuctionRepository auctionRepository;
    private final CategoryRepository categoryRepository;

    // 경매 목록 조회 및 검색

    // 수정
    @Transactional
    public AuctionDetailResponse updateAuction(Long auctionId, Long userId, AuctionUpdateRequest request){

        // 경매 조회 및 작성자 확인
        Auction auction = getAuctionAndValidateOwner(auctionId, userId);

        // 카테고리 조회
        Category category = categoryRepository.findById(request.categoryId())
                .orElseThrow(()-> new BusinessException(ErrorCode.CATEGORY_NOT_FOUND));

        LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        auction.update(
                request.title(),
                request.description(),
                request.image(),
                category,
                request.startPrice(),
                request.startAt(),
                request.endAt(),
                now
        );

        return AuctionDetailResponse.from(auction);
    }

    // 삭제
    @Transactional
    public void deleteAuction(Long auctionId, Long userId){

        // 경매 조회 및 작성자 확인
        Auction auction = getAuctionAndValidateOwner(auctionId, userId);

        LocalDateTime now = auctionRepository.findCurrentDatabaseTime();

        // 논리적 삭제
        auction.delete(now);
    }

    // 경매 조회 및 작성자 검증
    private Auction getAuctionAndValidateOwner(Long auctionId, Long userId){

        // 삭제되지 않은 경매 조회
        Auction auction = auctionRepository.findByIdAndIsDeletedFalse(auctionId)
                .orElseThrow(() ->
                        new BusinessException(ErrorCode.AUCTION_NOT_FOUND)
                );

        // 작성자 확인
        if (!auction.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.AUCTION_ACCESS_DENIED);
        }

        return auction;
    }

}
