package com.sesac.charity_auction.global.storage;

import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.UncheckedIOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.UUID;

/**
 * 업로드한 이미지를 검사하고 {upload-dir}/{폴더}/ 아래에 저장해요. (프로필 사진, 기부처 이미지가 함께 써요)
 * 저장한 파일은 WebConfig가 /uploads/** 주소로 보여 줘요.
 */
@Component
public class ImageStorage {
    private static final long MAX_BYTES = 2L * 1024 * 1024;
    private static final String URL_PREFIX = "/uploads/";

    private final Path root;

    public ImageStorage(@Value("${app.upload-dir}") final String uploadDir) {
        this.root = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    /**
     * 이미지를 저장하고 주소(/uploads/{폴더}/...)를 돌려줘요.
     *
     * @throws BusinessException 비었거나, 2MB를 넘거나, PNG/JPG/GIF/WEBP가 아니면
     */
    public String store(final String folder, final MultipartFile file) {
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
        final Path dir = root.resolve(folder);
        try {
            Files.createDirectories(dir);
            Files.write(dir.resolve(fileName), bytes);
        } catch (IOException e) {
            throw new UncheckedIOException(e);
        }
        return URL_PREFIX + folder + "/" + fileName;
    }

    /**
     * 예전 파일을 지워요. 우리가 저장한 주소일 때만 지우고(외부 주소나 null은 무시),
     * 지우지 못해도 예외는 던지지 않아요.
     */
    public void delete(final String url) {
        if (url == null || !url.startsWith(URL_PREFIX)) {
            return;
        }
        final Path target = root.resolve(url.substring(URL_PREFIX.length())).normalize();
        if (!target.startsWith(root)) {
            return;
        }
        try {
            Files.deleteIfExists(target);
        } catch (IOException ignored) {
            // 남은 파일은 용량만 차지할 뿐이라 무시해요.
        }
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
}
