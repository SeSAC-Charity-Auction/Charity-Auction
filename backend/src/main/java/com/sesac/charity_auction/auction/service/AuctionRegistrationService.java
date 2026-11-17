package com.sesac.charity_auction.auction.service;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.dto.request.AuctionRegistrationRequest;
import com.sesac.charity_auction.auction.dto.response.AuctionRegistrationResponse;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.category.repository.CategoryRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.global.storage.ImageStorage;
import com.sesac.charity_auction.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.transaction.support.TransactionSynchronization;
import org.springframework.transaction.support.TransactionSynchronizationManager;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class AuctionRegistrationService {
    private final AuctionRepository auctionRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;
    private final ImageStorage imageStorage;

    @Transactional
    public AuctionRegistrationResponse register(final long userId, final AuctionRegistrationRequest request, final MultipartFile file) {
        final var user = userRepository.findById(userId).filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));
        final var category = categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND));
        final var now = auctionRepository.findCurrentDatabaseTime();
        final var auction = Auction.create(user, category, request.startPrice(), request.title().trim(), now, now.plusHours(24));
        auction.describe(request.description());
        auction.start(now);
        final var image = imageStorage.store("auction", file);
        TransactionSynchronizationManager.registerSynchronization(new TransactionSynchronization() {
            @Override
            public void afterCompletion(int status) {
                if (status != STATUS_COMMITTED) {
                    imageStorage.delete(image);
                }
            }
        });
        auction.changeImage(image);
        return AuctionRegistrationResponse.from(auctionRepository.saveAndFlush(auction));
    }
}
