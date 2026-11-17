package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.donation.service.TargetEditPolicy;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.global.storage.ImageStorage;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuctionImageService {
    private static final String FOLDER = "auction";

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final TargetEditPolicy editPolicy; // 기부처 이미지와 같은 규칙(개발 환경에서만)을 써요
    private final ImageStorage imageStorage;

    public AuctionImageService(final UserRepository userRepository,
                               final AuctionRepository auctionRepository,
                               final TargetEditPolicy editPolicy,
                               final ImageStorage imageStorage) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.editPolicy = editPolicy;
        this.imageStorage = imageStorage;
    }

    /**
     * 경매 물품 이미지를 올리거나 바꿔요. 새 주소(/uploads/auction/...)를 돌려줘요.
     *
     * @throws BusinessException 로그인하지 않았으면 NOT_LOGGED_IN, 권한이 없으면 FORBIDDEN, 없거나 삭제된 경매면 AUCTION_NOT_FOUND
     */
    @Transactional
    public String upload(final long userId, final long auctionId, final MultipartFile file) {
        final User user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));
        if (!editPolicy.canEdit(user)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        final Auction auction = auctionRepository.findById(auctionId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));

        final String oldImage = auction.getImage();
        final String newImage = imageStorage.store(FOLDER, file);
        auction.changeImage(newImage);
        imageStorage.delete(oldImage);
        return newImage;
    }
}
