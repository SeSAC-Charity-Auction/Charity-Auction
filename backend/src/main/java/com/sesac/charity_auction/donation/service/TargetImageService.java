package com.sesac.charity_auction.donation.service;

import com.sesac.charity_auction.donation.domain.DonationTarget;
import com.sesac.charity_auction.donation.repository.DonationTargetRepository;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.global.storage.ImageStorage;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

@Service
public class TargetImageService {
    private static final String FOLDER = "target";

    private final UserRepository userRepository;
    private final DonationTargetRepository targetRepository;
    private final TargetEditPolicy editPolicy;
    private final ImageStorage imageStorage;

    public TargetImageService(final UserRepository userRepository,
                              final DonationTargetRepository targetRepository,
                              final TargetEditPolicy editPolicy,
                              final ImageStorage imageStorage) {
        this.userRepository = userRepository;
        this.targetRepository = targetRepository;
        this.editPolicy = editPolicy;
        this.imageStorage = imageStorage;
    }

    /**
     * 기부처 이미지를 올리거나 바꿔요. 새 주소(/uploads/target/...)를 돌려줘요.
     *
     * @throws BusinessException 로그인하지 않았으면 NOT_LOGGED_IN, 권한이 없으면 FORBIDDEN, 없는 기부처면 TARGET_NOT_FOUND
     */
    @Transactional
    public String upload(final long userId, final long targetId, final MultipartFile file) {
        final User user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));
        if (!editPolicy.canEdit(user)) {
            throw new BusinessException(ErrorCode.FORBIDDEN);
        }
        final DonationTarget target = targetRepository.findById(targetId)
                .orElseThrow(() -> new BusinessException(ErrorCode.TARGET_NOT_FOUND));

        final String oldImage = target.getTargetImage();
        final String newImage = imageStorage.store(FOLDER, file);
        target.changeImage(newImage);
        imageStorage.delete(oldImage);
        return newImage;
    }
}
