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

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

/**
 * GET /api/me/points: 기부하면 잔액과 내역(설명 문구 포함)에 실제로 반영되는지 확인해요.
 */
@SpringBootTest
@AutoConfigureMockMvc
class MyPointsApiTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    JdbcTemplate jdbc;

    long userId;
    long targetId;

    @BeforeEach
    void setUp() {
        final String key = UUID.randomUUID().toString().substring(0, 8);
        jdbc.update("INSERT INTO users (password, name, nickname, email, role, point, created_at, updated_at) "
                + "VALUES ('x', '테스터', ?, ?, 'USER', 52000, UTC_TIMESTAMP(), UTC_TIMESTAMP())", key, key + "@test.local");
        userId = jdbc.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, key + "@test.local");
        jdbc.update("INSERT INTO donation_targets (target_name, is_active, total_donation, target_amount, created_at) "
                + "VALUES ('내포인트 테스트 기부처', TRUE, 0, 1000000, UTC_TIMESTAMP())");
        targetId = jdbc.queryForObject(
                "SELECT MAX(target_id) FROM donation_targets WHERE target_name = '내포인트 테스트 기부처'", Long.class);
    }

    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM point_histories WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donations WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM users WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donation_targets WHERE target_id = ?", targetId);
    }

    @Test
    void 기부하면_잔액과_내역이_바뀐다() throws Exception {
        mockMvc.perform(get("/api/me/points").header("X-Dev-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(52000))
                .andExpect(jsonPath("$.recent.length()").value(0));

        mockMvc.perform(post("/api/donations").contentType(MediaType.APPLICATION_JSON)
                        .header("X-Dev-User-Id", userId)
                        .content("{\"targetId\":" + targetId + ",\"amount\":52000}")) // 전액 기부
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(0));

        mockMvc.perform(get("/api/me/points").header("X-Dev-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.balance").value(0))
                .andExpect(jsonPath("$.recent[0].pointType").value("사용"))
                .andExpect(jsonPath("$.recent[0].pointAmount").value(52000))
                .andExpect(jsonPath("$.recent[0].description").value("내포인트 테스트 기부처 기부"));
    }

    @Test
    void 로그인하지_않으면_401() throws Exception {
        mockMvc.perform(get("/api/me/points"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));
    }
}
