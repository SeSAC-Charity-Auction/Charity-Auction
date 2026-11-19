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
 * - 시드 경매의 상품 설명(dev-seed-auction-descriptions.sql)도 같은 방식으로 채워요. (짧은 설명만 바꿔요.)
 * - 기부처 추가분(6~15번)과 상세 설명도 같은 방식으로 채워요.
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
            "db/seed/dev-seed-auctions-more.sql",
            "db/seed/dev-seed-auctions-extra.sql",
            "db/seed/dev-seed-targets-extra.sql"
    };
    // 예전에 시드한 DB에는 없는 추가분이에요. 아직 없을 때만 따로 넣어요.
    private static final String EXTRA_SCRIPT = "db/seed/dev-seed-auctions-extra.sql";
    private static final String TARGETS_EXTRA_SCRIPT = "db/seed/dev-seed-targets-extra.sql";
    private static final String TARGET_DESCRIPTION_SCRIPT = "db/seed/dev-seed-target-descriptions.sql";

    private static final String IMAGE_SCRIPT = "db/seed/dev-seed-auction-images.sql";
    private static final String DESCRIPTION_SCRIPT = "db/seed/dev-seed-auction-descriptions.sql";
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
                seedExtraIfMissing();
                seedTargetsIfMissing();
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

    // 예전에 시드한 DB에 추가분(경매 201~240번, 입찰 2001번~)을 넣어요.
    // 번호가 하나라도 쓰이고 있거나, 판매자·입찰자 회원(2~17번)이 없으면 건드리지 않아요.
    private void seedExtraIfMissing() {
        try {
            final Long taken = jdbc.queryForObject(
                    "SELECT (SELECT COUNT(*) FROM auctions WHERE auction_id BETWEEN 201 AND 240)"
                            + " + (SELECT COUNT(*) FROM bids WHERE bid_id >= 2001)", Long.class);
            final Long users = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE user_id BETWEEN 2 AND 17", Long.class);
            final Long categories = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM categories WHERE category_id BETWEEN 1 AND 7", Long.class);
            if (taken == null || taken != 0 || users == null || users != 16 || categories == null || categories != 7) {
                return;
            }
            try (final Connection connection = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(connection, new ClassPathResource(EXTRA_SCRIPT));
            }
            log.info("개발용 더미 데이터: 진행 중 경매 추가분을 넣었어요.");
        } catch (final Exception e) {
            log.warn("개발용 더미 데이터 추가분을 넣지 못했어요: {}", e.getMessage());
        }
    }

    // 예전에 시드한 DB에 기부처 추가분(기부처 6~15번, 기부 300번~)을 넣어요.
    // 번호가 하나라도 쓰이고 있거나 회원 1~17번이 없으면 건드리지 않아요.
    private void seedTargetsIfMissing() {
        try {
            final Long taken = jdbc.queryForObject(
                    "SELECT (SELECT COUNT(*) FROM donation_targets WHERE target_id BETWEEN 6 AND 15)"
                            + " + (SELECT COUNT(*) FROM donations WHERE donation_id >= 300)", Long.class);
            final Long users = jdbc.queryForObject(
                    "SELECT COUNT(*) FROM users WHERE user_id BETWEEN 1 AND 17", Long.class);
            if (taken == null || taken != 0 || users == null || users != 17) {
                return;
            }
            try (final Connection connection = dataSource.getConnection()) {
                ScriptUtils.executeSqlScript(connection, new ClassPathResource(TARGETS_EXTRA_SCRIPT));
            }
            log.info("개발용 더미 데이터: 기부처 추가분을 넣었어요.");
        } catch (final Exception e) {
            log.warn("개발용 기부처 추가분을 넣지 못했어요: {}", e.getMessage());
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
                // 상품 설명도 같은 방식이에요. (설명이 짧은 시드 경매에만 긴 설명을 넣어요.)
                ScriptUtils.executeSqlScript(connection, new ClassPathResource(DESCRIPTION_SCRIPT));
                // 기부처 상세 설명도 같은 방식이에요.
                ScriptUtils.executeSqlScript(connection, new ClassPathResource(TARGET_DESCRIPTION_SCRIPT));
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
