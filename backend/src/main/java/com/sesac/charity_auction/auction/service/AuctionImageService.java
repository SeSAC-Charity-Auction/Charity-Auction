package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.global.storage.ImageStorage;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class AuctionImageService {
    private static final String FOLDER = "auction";

    private final UserRepository userRepository;
    private final AuctionRepository auctionRepository;
    private final ImageStorage imageStorage;
    private final Environment environment;

    public AuctionImageService(final UserRepository userRepository,
                               final AuctionRepository auctionRepository,
                               final ImageStorage imageStorage,
                               final Environment environment) {
        this.userRepository = userRepository;
        this.auctionRepository = auctionRepository;
        this.imageStorage = imageStorage;
        this.environment = environment;
    }

    /**
     * 경매 물품 이미지를 올리거나 바꿔요. 새 주소(/uploads/auction/...)를 돌려줘요.
     *
     * @throws BusinessException 로그인하지 않았으면 NOT_LOGGED_IN, 판매자가 아니면(개발 프로필 제외) FORBIDDEN, 없거나 삭제된 경매면 AUCTION_NOT_FOUND
     */
    @Transactional
    public String upload(final long userId, final long auctionId, final MultipartFile file) {
        final User user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));
        final Auction auction = auctionRepository.findById(auctionId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.AUCTION_NOT_FOUND));
        // 판매자만 바꿀 수 있어요. 단, 개발(local) 프로필에서는 화면의 "이미지 변경 (개발 모드)" 버튼이
        // 어떤 경매에서든 동작하도록 판매자가 아니어도 허용해요.
        final boolean dev = environment.acceptsProfiles(Profiles.of("local"));
        if (!dev && !auction.getUser().getId().equals(user.getId())) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }

        final String oldImage = auction.getImage();
        final String newImage = imageStorage.store(FOLDER, file);
        auction.changeImage(newImage);
        imageStorage.delete(oldImage);
        return newImage;
    }
}
