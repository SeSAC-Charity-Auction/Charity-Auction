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
 * GET /api/me (마이페이지): 내 정보와 기부 통계가 실제 DB 값으로 나오는지 확인해요.
 */
@SpringBootTest
@AutoConfigureMockMvc
class MyProfileApiTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    JdbcTemplate jdbc;

    String key;
    long userId;
    long targetId;

    @BeforeEach
    void setUp() {
        key = UUID.randomUUID().toString().substring(0, 8);
        jdbc.update("INSERT INTO users (password, name, nickname, email, role, point_balance, created_at, updated_at) "
                        + "VALUES ('secret-hash', '테스터', ?, ?, 'USER', 30000, UTC_TIMESTAMP(), UTC_TIMESTAMP())",
                "닉" + key.substring(0, 4), key + "@test.local");
        userId = jdbc.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, key + "@test.local");
        jdbc.update("INSERT INTO donation_targets (target_name, is_active, total_donation, target_amount, created_at) "
                + "VALUES ('마이페이지 테스트 기부처', TRUE, 0, 1000000, UTC_TIMESTAMP())");
        targetId = jdbc.queryForObject(
                "SELECT MAX(target_id) FROM donation_targets WHERE target_name = '마이페이지 테스트 기부처'", Long.class);
    }

    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM point_histories WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donations WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM users WHERE user_id = ?", userId);
        jdbc.update("DELETE FROM donation_targets WHERE target_id = ?", targetId);
    }

    @Test
    void 내_정보와_기부_통계를_돌려주고_비밀번호는_내보내지_않는다() throws Exception {
        for (final int amount : new int[]{3000, 4500}) {
            mockMvc.perform(post("/api/donations").contentType(MediaType.APPLICATION_JSON)
                            .header("X-Dev-User-Id", userId)
                            .content("{\"targetId\":" + targetId + ",\"amount\":" + amount + "}"))
                    .andExpect(status().isOk());
        }

        mockMvc.perform(get("/api/me").header("X-Dev-User-Id", userId))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId))
                .andExpect(jsonPath("$.email").value(key + "@test.local"))
                .andExpect(jsonPath("$.point").value(22500))           // 30,000 - 3,000 - 4,500
                .andExpect(jsonPath("$.donationCount").value(2))
                .andExpect(jsonPath("$.totalDonation").value(7500))
                .andExpect(jsonPath("$.userImage").doesNotExist())     // 이미지가 없으면 null
                .andExpect(jsonPath("$.createdAt").exists())
                .andExpect(jsonPath("$.password").doesNotExist());
    }

    @Test
    void 탈퇴한_회원은_로그인하지_않은_것으로_처리한다() throws Exception {
        jdbc.update("UPDATE users SET is_deleted = TRUE WHERE user_id = ?", userId);

        mockMvc.perform(get("/api/me").header("X-Dev-User-Id", userId))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));
    }

    @Test
    void 로그인하지_않으면_401() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));
    }
}
