package com.sesac.charity_auction.global.seed;

import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.core.io.ClassPathResource;
import org.springframework.context.annotation.Profile;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.datasource.init.ScriptUtils;
import org.springframework.stereotype.Component;

import javax.sql.DataSource;
import java.sql.Connection;

/**
 * 개발용 더미 데이터를 자동으로 넣어요. 그래서 GitHub에서 받아 처음 실행한 사람도 바로 화면을 볼 수 있어요.
 *  - local 프로필에서만 돌아요. (배포 환경에서는 절대 실행되지 않아요.)
 *  - 회원·경매·기부처가 모두 "비어 있을 때만" 넣어요. 이미 데이터가 있는 DB는 건드리지 않아요.
 *  - 끄려면 app.dev-seed.enabled=false (환경 변수 APP_DEV_SEED_ENABLED=false)로 지정하세요.
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

    private final DataSource dataSource;
    private final JdbcTemplate jdbc;

    public DevSeedRunner(final DataSource dataSource, final JdbcTemplate jdbc) {
        this.dataSource = dataSource;
        this.jdbc = jdbc;
    }

    @Override
    public void run(final ApplicationArguments args) {
        try {
            if (!isEmpty("users") || !isEmpty("auctions") || !isEmpty("donation_targets")) {
                log.info("개발용 더미 데이터: 이미 데이터가 있어서 넣지 않아요.");
                return;
            }
            try (Connection connection = dataSource.getConnection()) {
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

    private boolean isEmpty(final String table) {
        final Long count = jdbc.queryForObject("SELECT COUNT(*) FROM " + table, Long.class);
        return count == null || count == 0;
    }
}
