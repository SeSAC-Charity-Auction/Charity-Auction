package com.sesac.charity_auction.user.service;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

@Service
public class ProfileImageService {
    private static final long MAX_BYTES = 2L * 1024 * 1024;
    private static final String URL_PREFIX = "/uploads/profile/";

    private final UserRepository userRepository;
    private final Path profileDir;

    public ProfileImageService(final UserRepository userRepository,
                               @Value("${app.upload-dir}") final String uploadDir) {
        this.userRepository = userRepository;
        this.profileDir = Path.of(uploadDir).toAbsolutePath().normalize().resolve("profile");
    }

    /**
     * 프로필 사진을 저장하고 새 주소(/uploads/profile/...)를 돌려줘요.
     */
    @Transactional
    public String upload(final long userId, final MultipartFile file) {
        final User user = userRepository.findById(userId)
                .filter(found -> !found.isDeleted())
                .orElseThrow(() -> new BusinessException(ErrorCode.NOT_LOGGED_IN));

        if (file == null || file.isEmpty()) {
            throw new BusinessException(ErrorCode.INVALID_IMAGE);
        }
        if (file.getSize() > MAX_BYTES) {
            throw new BusinessException(ErrorCode.IMAGE_TOO_LARGE);
        }

        final byte[] bytes;
        try {
            bytes = file.getBytes();
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        // 보내 준 파일 이름·형식은 믿지 않고, 파일 내용의 앞부분으로 종류를 확인해요.
        final String ext = detectExtension(bytes);
        if (ext == null) {
            throw new BusinessException(ErrorCode.INVALID_IMAGE);
        }

        final String fileName = UUID.randomUUID() + "." + ext;
        try {
            Files.createDirectories(profileDir);
            Files.write(profileDir.resolve(fileName), bytes);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }

        final String oldImage = user.getImage();
        final String newImage = URL_PREFIX + fileName;
        user.changeImage(newImage);
        deleteOld(oldImage);
        return newImage;
    }

    private static String detectExtension(final byte[] b) {
        if (b.length >= 8 && (b[0] & 0xFF) == 0x89 && b[1] == 'P' && b[2] == 'N' && b[3] == 'G') {
            return "png";
        }
        if (b.length >= 3 && (b[0] & 0xFF) == 0xFF && (b[1] & 0xFF) == 0xD8 && (b[2] & 0xFF) == 0xFF) {
            return "jpg";
        }
        if (b.length >= 6 && b[0] == 'G' && b[1] == 'I' && b[2] == 'F' && b[3] == '8') {
            return "gif";
        }
        if (b.length >= 12 && b[0] == 'R' && b[1] == 'I' && b[2] == 'F' && b[3] == 'F'
                && b[8] == 'W' && b[9] == 'E' && b[10] == 'B' && b[11] == 'P') {
            return "webp";
        }
        return null;
    }

    // 예전 사진 파일을 지워요. 우리가 저장한 주소일 때만 지우고, 실패해도 업로드는 그대로 성공시켜요.
    private void deleteOld(final String oldImage) {
        if (oldImage == null || !oldImage.startsWith(URL_PREFIX)) {
            return;
        }
        final Path target = profileDir.resolve(oldImage.substring(URL_PREFIX.length())).normalize();
        if (!target.startsWith(profileDir)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // 남은 파일은 용량만 차지할 뿐이라 무시해요.
        }
    }
}
