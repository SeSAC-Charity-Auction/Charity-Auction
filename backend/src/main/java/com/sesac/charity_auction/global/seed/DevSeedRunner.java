package com.sesac.charity_auction.global.seed;

import lombok.extern.slf4j.Slf4j;
import org.jspecify.annotations.NonNull;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Profile;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardCopyOption;
import java.sql.Connection;
import java.sql.SQLException;

/**
 * 개발용 더미 데이터를 자동으로 넣어요. 그래서 GitHub에서 받아 처음 실행한 사람도 바로 화면을 볼 수 있어요.
 * - local 프로필에서만 돌아요. (배포 환경에서는 절대 실행되지 않아요.)
 * - 회원·경매·기부처가 모두 "비어 있을 때만" 넣어요. 이미 데이터가 있는 DB는 건드리지 않아요.
 * - 시드 경매의 이미지(db/seed/images/auction)는 DB가 이미 있어도 매번 업로드 폴더로 복사하고 연결해요.
 *   (비어 있는 파일·이미지만 채우고, 직접 올린 이미지는 그대로 둬요.)
 * - 끄려면 app.dev-seed.enabled=false (환경 변수 APP_DEV_SEED_ENABLED=false)로 지정하세요.
 */
@Slf4j
@Component
@Profile("local")
@ConditionalOnProperty(name = "app.dev-seed.enabled", havingValue = "true", matchIfMissing = true)
public class DevSeedRunner implements ApplicationRunner {
    private static final String[] SCRIPTS = {
            "db/seed/dev-seed.sql",
            "db/seed/dev-seed-auctions.sql",
            "db/seed/dev-seed-auctions-more.sql"
    };

    private static final String IMAGE_SCRIPT = "db/seed/dev-seed-auction-images.sql";
    private static final String IMAGE_DIR = "db/seed/images/auction/";

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;
    private final Path uploadRoot;

    public DevSeedRunner(final DataSource dataSource, final JdbcTemplate jdbc,
                         @Value("${app.upload-dir}") final String uploadDir) {
        this.dataSource = dataSource;
        this.jdbc = jdbc;
        this.uploadRoot = Path.of(uploadDir).toAbsolutePath().normalize();
    }

    @Override
    public void run(final @NonNull ApplicationArguments args) {
        seedData();
        seedImages();
    }

    private void seedData() {
        try {
            if (!isEmpty("users") || !isEmpty("auctions") || !isEmpty("donation_targets")) {
                log.info("개발용 더미 데이터: 이미 데이터가 있어서 넣지 않아요.");
                return;
            }
            try (final Connection connection = dataSource.getConnection()) {
                for (final String script : SCRIPTS) {
                    ScriptUtils.executeSqlScript(connection, new ClassPathResource(script));
                }
            }
            log.info("개발용 더미 데이터를 넣었어요. (회원, 기부, 경매)");
        } catch (final Exception e) {
            // 더미 데이터가 안 들어가도 앱은 떠야 해요.
            log.warn("개발용 더미 데이터를 넣지 못했어요: {}", e.getMessage());
        }
    }

    // 시드 경매 이미지를 업로드 폴더에 복사하고(이미 있으면 건너뛰어요) 경매에 연결해요.
    private void seedImages() {
        try {
            final Resource[] images = new PathMatchingResourcePatternResolver()
                    .getResources("classpath:" + IMAGE_DIR + "*");
            final Path folder = uploadRoot.resolve("auction");
            Files.createDirectories(folder);
            int copied = 0;
            for (final Resource image : images) {
                final String name = image.getFilename();
                if (name == null) {
                    continue;
                }
                final Path target = folder.resolve(name).normalize();
                if (!target.startsWith(folder) || Files.exists(target)) {
                    continue;
                }
                try (final InputStream in = image.getInputStream()) {
                    Files.copy(in, target, StandardCopyOption.REPLACE_EXISTING);
                    copied++;
                }
            }
            try (final Connection connection = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(connection, new ClassPathResource(IMAGE_SCRIPT));
            }
            if (copied > 0) {
                log.info("개발용 경매 이미지를 {}장 복사했어요. ({})", copied, folder);
            }
        } catch (final IOException | SQLException | RuntimeException e) {
            // 이미지가 안 들어가도 앱은 떠야 해요.
            log.warn("개발용 경매 이미지를 넣지 못했어요: {}", e.getMessage());
        }
    }

    private boolean isEmpty(final String table) {
        final Long count = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
        return count == null || count == 0;
    }
}
