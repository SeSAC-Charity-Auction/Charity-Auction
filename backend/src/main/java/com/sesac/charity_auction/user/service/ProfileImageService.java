package com.sesac.charity_auction.user.service;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.global.storage.ImageStorage;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class ProfileImageService {
    private static final String FOLDER = "profile";

    private final UserRepository userRepository;
    private final ImageStorage imageStorage;

    public ProfileImageService(final UserRepository userRepository, final ImageStorage imageStorage) {
        this.userRepository = userRepository;
        this.imageStorage = imageStorage;
    }

    /**
     * 프로필 사진을 저장하고 새 주소(/uploads/profile/...)를 돌려줘요.
     */
    @Transactional
    public String upload(final long userId, final MultipartFile file) {
        final User user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        final String oldImage = user.getImage();
        final String newImage = imageStorage.store(FOLDER, file);
        user.changeImage(newImage);
        imageStorage.delete(oldImage);
        return newImage;
    }
}
