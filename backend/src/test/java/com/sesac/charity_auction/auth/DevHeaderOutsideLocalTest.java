package com.sesac.charity_auction.auth;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("prod")
class DevHeaderOutsideLocalTest {
    @Autowired
    MockMvc mockMvc;

    @Test
    void local이_아니면_X_Dev_User_Id_헤더로_로그인할_수_없다() throws Exception {
        mockMvc.perform(get("/api/me").header("X-Dev-User-Id", 1))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));
    }
}
