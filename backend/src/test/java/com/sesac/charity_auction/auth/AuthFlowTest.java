package com.sesac.charity_auction.auth;

import com.jayway.jsonpath.JsonPath;
import jakarta.servlet.http.Cookie;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.test.web.servlet.ResultActions;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.Future;
import java.util.concurrent.TimeUnit;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.options;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
class AuthFlowTest {
    private static final String PASSWORD = "password123";
    private static final String REFRESH_COOKIE = "refresh_token";

    @Autowired
    MockMvc mockMvc;
    @Autowired
    JdbcTemplate jdbc;
    @Autowired
    JwtEncoder jwtEncoder;

    String email;
    String nickname;

    @BeforeEach
    void setUp() throws Exception {
        final String key = UUID.randomUUID().toString().substring(0, 8);
        email = key + "@auth.test";
        nickname = "a" + key.substring(0, 7);
        signup(email, nickname).andExpect(status().isCreated());
    }

    @AfterEach
    void tearDown() {
        jdbc.update("DELETE FROM refresh_tokens WHERE user_id IN (SELECT user_id FROM users WHERE email = ?)", email);
        jdbc.update("DELETE FROM users WHERE email = ?", email);
    }

    private ResultActions signup(final String signupEmail, final String signupNickname) throws Exception {
        return mockMvc.perform(post("/api/v1/users/signup").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "%s", "nickname": "%s", "name": "홍길동"}
                        """.formatted(signupEmail, PASSWORD, signupNickname)));
    }

    private ResultActions login(final String loginEmail, final String password) throws Exception {
        return mockMvc.perform(post("/api/v1/auth/login").contentType(MediaType.APPLICATION_JSON)
                .content("""
                        {"email": "%s", "password": "%s"}
                        """.formatted(loginEmail, password)));
    }

    private ResultActions refresh(final String refreshToken) throws Exception {
        final var request = post("/api/v1/auth/refresh");
        if (refreshToken != null) {
            request.cookie(new Cookie(REFRESH_COOKIE, refreshToken));
        }
        return mockMvc.perform(request);
    }

    private static String accessToken(final MvcResult result) throws Exception {
        return JsonPath.read(result.getResponse().getContentAsString(), "$.accessToken");
    }

    private static String refreshToken(final MvcResult result) {
        final Cookie cookie = result.getResponse().getCookie(REFRESH_COOKIE);
        return cookie == null ? null : cookie.getValue();
    }

    private static String bearer(final String accessToken) {
        return "Bearer " + accessToken;
    }

    private long userId() {
        return jdbc.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, email);
    }

    private int savedRefreshTokens() {
        return jdbc.queryForObject("SELECT COUNT(*) FROM refresh_tokens WHERE user_id = ?", Integer.class, userId());
    }

    @Test
    void 가입한_계정으로_로그인하면_Access_Token은_본문에_Refresh_Token은_HttpOnly_쿠키에_담긴다() throws Exception {
        final MvcResult result = login(email, PASSWORD)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andExpect(jsonPath("$.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.expiresIn").value(3600))
                .andReturn();

        assertThat(result.getResponse().getHeader(HttpHeaders.SET_COOKIE))
                .startsWith(REFRESH_COOKIE + "=")
                .contains("HttpOnly", "SameSite=Strict", "Path=/api/v1/auth", "Max-Age=1209600");

        final String savedHash = jdbc.queryForObject(
                "SELECT token_hash FROM refresh_tokens WHERE user_id = ?", String.class, userId());
        assertThat(savedHash).hasSize(64).isNotEqualTo(refreshToken(result));
    }

    @Test
    void Access_Token으로_로그인이_필요한_API를_부를_수_있다() throws Exception {
        final String accessToken = accessToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());

        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.userId").value(userId()))
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void 비밀번호가_틀리거나_없는_이메일이면_같은_401_응답이고_토큰을_주지_않는다() throws Exception {
        login(email, "wrong-password")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("LOGIN_FAILED"))
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE));
        login("nobody-" + email, PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("LOGIN_FAILED"))
                .andExpect(header().doesNotExist(HttpHeaders.SET_COOKIE));
    }

    @Test
    void 토큰_없이_로그인이_필요한_API를_부르면_401_NOT_LOGGED_IN() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));
    }

    @Test
    void 위조되거나_만료된_Access_Token은_401_INVALID_TOKEN() throws Exception {
        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer("not.a.jwt")))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));

        final Instant past = Instant.now().minusSeconds(7200);
        final String expired = jwtEncoder.encode(JwtEncoderParameters.from(
                JwsHeader.with(MacAlgorithm.HS256).build(),
                JwtClaimsSet.builder()
                        .subject(String.valueOf(userId()))
                        .issuedAt(past)
                        .expiresAt(past.plusSeconds(60))
                        .claim("authorities", List.of("ROLE_USER"))
                        .build())).getTokenValue();
        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer(expired)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_TOKEN"));
    }

    @Test
    void 재발급하면_두_토큰이_모두_바뀌고_이미_쓴_Refresh_Token은_다시_못_쓴다() throws Exception {
        final MvcResult loggedIn = login(email, PASSWORD).andExpect(status().isOk()).andReturn();
        final String oldRefreshToken = refreshToken(loggedIn);

        final MvcResult refreshed = refresh(oldRefreshToken)
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.tokenType").value("Bearer"))
                .andReturn();
        assertThat(refreshToken(refreshed)).isNotBlank().isNotEqualTo(oldRefreshToken);
        assertThat(accessToken(refreshed)).isNotEqualTo(accessToken(loggedIn));
        assertThat(refreshed.getResponse().getHeader(HttpHeaders.SET_COOKIE))
                .contains("HttpOnly", "SameSite=Strict", "Path=/api/v1/auth");

        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken(refreshed))))
                .andExpect(status().isOk());

        refresh(oldRefreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"));
    }

    @Test
    void Refresh_Token_쿠키가_없거나_틀리거나_만료되면_재발급은_401() throws Exception {
        refresh(null)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"))
                .andExpect(jsonPath("$.message").value("Refresh Token이 필요해요."));
        refresh("not-a-real-token")
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("유효하지 않은 Refresh Token이에요."));

        final String refreshToken = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());
        jdbc.update("UPDATE refresh_tokens SET expires_at = UTC_TIMESTAMP() - INTERVAL 1 MINUTE WHERE user_id = ?", userId());
        refresh(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.message").value("만료된 Refresh Token이에요."));
    }

    @Test
    void 로그아웃하면_쿠키가_지워지고_그_Refresh_Token으로는_재발급할_수_없다() throws Exception {
        final String refreshToken = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());

        final MvcResult loggedOut = mockMvc.perform(post("/api/v1/auth/logout")
                        .cookie(new Cookie(REFRESH_COOKIE, refreshToken)))
                .andExpect(status().isNoContent())
                .andReturn();
        assertThat(loggedOut.getResponse().getHeader(HttpHeaders.SET_COOKIE))
                .startsWith(REFRESH_COOKIE + "=")
                .contains("Max-Age=0", "Path=/api/v1/auth");
        assertThat(savedRefreshTokens()).isZero();

        refresh(refreshToken).andExpect(status().isUnauthorized());
    }

    @Test
    void 다시_로그인하면_한_줄만_남고_예전_Refresh_Token은_더_못_쓴다() throws Exception {
        final String first = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());
        final String second = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());

        assertThat(second).isNotEqualTo(first);
        assertThat(savedRefreshTokens()).isEqualTo(1);
        refresh(first).andExpect(status().isUnauthorized());
        refresh(second).andExpect(status().isOk());
    }

    @Test
    void 탈퇴하면_로그인과_재발급이_막히고_같은_이메일로_다시_가입할_수_없다() throws Exception {
        final MvcResult loggedIn = login(email, PASSWORD).andExpect(status().isOk()).andReturn();
        final String accessToken = accessToken(loggedIn);
        final String refreshToken = refreshToken(loggedIn);

        mockMvc.perform(delete("/api/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isNoContent());

        assertThat(savedRefreshTokens()).isZero();
        refresh(refreshToken).andExpect(status().isUnauthorized());

        login(email, PASSWORD)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("LOGIN_FAILED"));

        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer(accessToken)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("NOT_LOGGED_IN"));

        signup(email, "b" + nickname.substring(1))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("DUPLICATE_EMAIL"));
        mockMvc.perform(get("/api/v1/users/check-email").param("email", email))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.available").value(false));
    }

    @Test
    void 로그인하지_않아도_공개_API는_쓸_수_있다() throws Exception {
        mockMvc.perform(get("/api/donations/summary")).andExpect(status().isOk());
        mockMvc.perform(get("/api/health")).andExpect(status().isOk());
        mockMvc.perform(get("/api/v1/users/check-nickname").param("nickname", "zz" + nickname.substring(1, 6)))
                .andExpect(status().isOk());
    }

    @Test
    void local_프로필에서는_X_Dev_User_Id_헤더도_계속_쓸_수_있다() throws Exception {
        mockMvc.perform(get("/api/me").header("X-Dev-User-Id", userId()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void 탈퇴_처리된_계정은_유효한_Refresh_Token이_있어도_재발급할_수_없다() throws Exception {
        final String refreshToken = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());
        jdbc.update("UPDATE users SET is_deleted = TRUE WHERE user_id = ?", userId());

        refresh(refreshToken)
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("INVALID_REFRESH_TOKEN"))
                .andExpect(jsonPath("$.message").value("사용할 수 없는 계정이에요."));
    }

    @Test
    void 만료된_Access_Token이_같이_와도_재발급은_된다() throws Exception {
        final String refreshToken = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());

        mockMvc.perform(post("/api/v1/auth/refresh")
                        .header(HttpHeaders.AUTHORIZATION, bearer("expired.or.broken"))
                        .cookie(new Cookie(REFRESH_COOKIE, refreshToken)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.accessToken").isNotEmpty());
    }

    @Test
    void 같은_Refresh_Token으로_동시에_재발급하면_한_요청만_성공한다() throws Exception {
        final String refreshToken = refreshToken(login(email, PASSWORD).andExpect(status().isOk()).andReturn());
        final int requests = 5;
        final ExecutorService pool = Executors.newFixedThreadPool(requests);
        final CountDownLatch ready = new CountDownLatch(requests);
        final CountDownLatch go = new CountDownLatch(1);
        try {
            final List<Future<Integer>> results = new ArrayList<>();
            for (int i = 0; i < requests; i++) {
                results.add(pool.submit(() -> {
                    ready.countDown();
                    go.await();
                    return refresh(refreshToken).andReturn().getResponse().getStatus();
                }));
            }
            assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
            go.countDown();

            int ok = 0;
            for (final Future<Integer> result : results) {
                final int status = result.get(30, TimeUnit.SECONDS);
                assertThat(status).isIn(200, 401);
                if (status == 200) {
                    ok++;
                }
            }
            assertThat(ok).isEqualTo(1);
        } finally {
            pool.shutdownNow();
        }
    }

    @Test
    void 로그인하지_않은_사람이_보는_조회_API는_401이_아니다() throws Exception {
        mockMvc.perform(get("/api/donation-targets/999999999"))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.code").value("TARGET_NOT_FOUND"));
        mockMvc.perform(get("/api/v1/999999999/bids"))
                .andExpect(status().isNotFound());
    }

    @Test
    void 로그인이_필요한_401_응답에는_WWW_Authenticate_헤더가_있다() throws Exception {
        mockMvc.perform(get("/api/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer"));
        mockMvc.perform(get("/api/me").header(HttpHeaders.AUTHORIZATION, bearer("not.a.jwt")))
                .andExpect(status().isUnauthorized())
                .andExpect(header().string(HttpHeaders.WWW_AUTHENTICATE, "Bearer error=\"invalid_token\""));
    }

    @Test
    void 허용한_출처의_사전_요청은_통과하고_다른_출처는_거절한다() throws Exception {
        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:3000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isOk())
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, "http://localhost:3000"))
                .andExpect(header().string(HttpHeaders.ACCESS_CONTROL_ALLOW_CREDENTIALS, "true"));

        mockMvc.perform(options("/api/v1/auth/login")
                        .header(HttpHeaders.ORIGIN, "http://localhost:4000")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "POST")
                        .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "Content-Type"))
                .andExpect(status().isForbidden())
                .andExpect(header().doesNotExist(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN));
    }
}
