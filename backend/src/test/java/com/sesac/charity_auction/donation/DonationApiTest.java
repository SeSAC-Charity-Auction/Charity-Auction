package com.sesac.charity_auction.donation;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * POST /api/donations 통합 테스트. 실제 DB(MySQL)를 쓰고, 테스트마다 자기 데이터를 만들고 지워요.
 * (서비스가 직접 트랜잭션을 열기 때문에 테스트에 @Transactional을 붙이지 않았어요.
 * 붙이면 "실패하면 되돌려지는지"를 확인할 수 없어요.)
 */
@SpringBootTest
@AutoConfigureMockMvc
class DonationApiTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    JdbcTemplate jdbc;

    long userId;
    long openTargetId;
    long closedTargetId;

    @BeforeEach
    void setUp() {
        final String key = UUID.randomUUID().toString().substring(0, 8);
        jdbc.update("INSERT INTO users (password, name, nickname, email, role, point, created_at, updated_at) "
                + "VALUES ('x', '테스터', ?, ?, 'USER', 50000, UTC_TIMESTAMP(), UTC_TIMESTAMP())", key, key + "@test.local");
        userId = jdbc.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, key + "@test.local");
        openTargetId = createTarget("테스트 열린 기부처", true);
        closedTargetId = createTarget("테스트 닫힌 기부처", false);
    }

    @AfterEach
    void tearDown() {
        // 외래키 때문에 자식 테이블부터 지워요.
        jdbc.update("DELETE FROM point_histories WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donations WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM users WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donation_targets WHERE target_id IN (?, ?)", openTargetId, closedTargetId);
    }

    private long createTarget(final String name, final boolean active) {
        jdbc.update("INSERT INTO donation_targets (target_name, is_active, total_donation, target_amount, created_at) "
                + "VALUES (?, ?, 0, 1000000, UTC_TIMESTAMP())", name, active);
        return jdbc.queryForObject("SELECT MAX(target_id) FROM donation_targets WHERE target_name = ?", Long.class, name);
    }

    private ResultActions donate(final Long asUser, final long targetId, final Object amount) throws Exception {
        final var req = post("/api/donations").contentType(MediaType.APPLICATION_JSON)
                .content("{\"targetId\":" + targetId + ",\"amount\":" + amount + "}");
        if (asUser != null) req.header("X-Dev-User-Id", asUser);
        return mockMvc.perform(req);
    }

    private long balance() {
        return jdbc.queryForObject("SELECT point FROM users WHERE user_id = ?", Long.class, userId);
    }

    private long targetTotal(final long targetId) {
        return jdbc.queryForObject("SELECT total_donation FROM donation_targets WHERE target_id = ?", Long.class, targetId);
    }

    private int count(final String table) {
        return jdbc.queryForObject("SELECT COUNT(*) FROM " + table + " WHERE user_id = ?", Integer.class, userId);
    }

    @Test
    void 기부하면_잔액_누적액_기록이_모두_바뀐다() throws Exception {
        donate(userId, openTargetId, 3300) // 100원 단위
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.amount").value(3300))
                .andExpect(jsonPath("$.balance").value(46700));

        assertThat(balance()).isEqualTo(46700);
        assertThat(targetTotal(openTargetId)).isEqualTo(3300);
        assertThat(count("donations")).isEqualTo(1);
        assertThat(jdbc.queryForObject(
                "SELECT COUNT(*) FROM point_histories WHERE user_id = ? AND point_type = 'USE' "
                        + "AND point_amount = 3300 AND donation_id IS NOT NULL", Integer.class, userId)).isEqualTo(1);
    }

    @Test
    void 단위나_최소금액에_안_맞으면_INVALID_AMOUNT() throws Exception {
        for (final Object bad : new Object[]{3350, 999, 0, -1000}) {
            donate(userId, openTargetId, bad)
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"));
        }
        assertThat(balance()).isEqualTo(50000);
        assertThat(count("donations")).isZero();
    }

    @Test
    void 금액이_없으면_INVALID_AMOUNT() throws Exception {
        donate(userId, openTargetId, "null")
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.code").value("INVALID_AMOUNT"));
    }

    @Test
    void 잔액이_모자라면_INSUFFICIENT_POINT_이고_아무것도_안_바뀐다() throws Exception {
        donate(userId, openTargetId, 50100)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("INSUFFICIENT_POINT"));

        assertThat(balance()).isEqualTo(50000);
        assertThat(targetTotal(openTargetId)).isZero();
        assertThat(count("donations")).isZero();
    }

    @Test
    void 마감된_기부처면_TARGET_CLOSED_이고_차감된_잔액도_되돌려진다() throws Exception {
        donate(userId, closedTargetId, 5000)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TARGET_CLOSED"));

        assertThat(balance()).isEqualTo(50000); // 3번 단계에서 실패해도 2번의 차감이 롤백돼요
        assertThat(count("donations")).isZero();
        assertThat(count("point_histories")).isZero();
    }

    @Test
    void 목표를_채운_기부처면_TARGET_CLOSED_이고_잔액은_그대로() throws Exception {
        jdbc.update("UPDATE donation_targets SET is_achieved = TRUE WHERE target_id = ?", openTargetId);

        donate(userId, openTargetId, 5000)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TARGET_CLOSED"));

        assertThat(balance()).isEqualTo(50000);
        assertThat(targetTotal(openTargetId)).isZero();
        assertThat(count("donations")).isZero();
    }

    @Test
    void 기부로_목표에_닿으면_달성_표시가_켜지고_그_뒤_기부는_막힌다() throws Exception {
        jdbc.update("UPDATE donation_targets SET target_amount = 5000 WHERE target_id = ?", openTargetId);

        donate(userId, openTargetId, 5000).andExpect(status().isOk());
        assertThat(jdbc.queryForObject("SELECT is_achieved FROM donation_targets WHERE target_id = ?",
                Boolean.class, openTargetId)).isTrue();

        donate(userId, openTargetId, 1000)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("TARGET_CLOSED"));
    }

    @Test
    void 남은_금액을_넘게_기부하면_DONATION_EXCEEDS_TARGET_이고_잔액은_그대로() throws Exception {
        // 목표 500, 현재 300 → 남은 200. 300원은 안 되고 200원은 돼요.
        jdbc.update("UPDATE donation_targets SET target_amount = 500, total_donation = 300 WHERE target_id = ?", openTargetId);

        donate(userId, openTargetId, 300)
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DONATION_EXCEEDS_TARGET"));
        assertThat(balance()).isEqualTo(50000);
        assertThat(targetTotal(openTargetId)).isEqualTo(300);
        assertThat(count("donations")).isZero();

        donate(userId, openTargetId, 200).andExpect(status().isOk());
        assertThat(targetTotal(openTargetId)).isEqualTo(500);
        assertThat(jdbc.queryForObject("SELECT is_achieved FROM donation_targets WHERE target_id = ?",
                Boolean.class, openTargetId)).isTrue();
    }

    @Test
    void 없는_기부처면_TARGET_NOT_FOUND_이고_잔액은_그대로() throws Exception {
        donate(userId, 999_999_999L, 5000)
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TARGET_NOT_FOUND"));

        assertThat(balance()).isEqualTo(50000);
    }

    @Test
    void 로그인하지_않으면_NOT_LOGGED_IN() throws Exception {
        donate(null, openTargetId, 5000)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));

        assertThat(balance()).isEqualTo(50000);
    }
}
