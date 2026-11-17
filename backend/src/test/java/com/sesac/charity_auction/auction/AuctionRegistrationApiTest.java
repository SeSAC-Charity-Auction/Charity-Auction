package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.dto.request.AuctionRegistrationRequest;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.auction.service.AuctionRegistrationService;
import com.sesac.charity_auction.auction.service.AuctionService;
import com.sesac.charity_auction.category.domain.Category;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import jakarta.persistence.EntityManager;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.BeanUtils;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auction-registration;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false", "spring.flyway.enabled=false",
        "security.jwt.secret=dGhpcy1pcy1hLXRlc3Qtb25seS0zMi1ieXRlLXNlY3JldC1rZXk=",
        "scheduler.auction.enabled=false", "app.upload-dir=${java.io.tmpdir}/charity-registration-tests"
})
@AutoConfigureMockMvc
@ActiveProfiles("registration-test")
@Transactional
class AuctionRegistrationApiTest {
    @Autowired MockMvc mvc;
    @Autowired EntityManager em;
    @Autowired UserRepository users;
    @Autowired AuctionRepository auctions;
    @Autowired AuctionRegistrationService registration;
    @Autowired AuctionService closing;
    User seller;
    Category category;

    @BeforeEach
    void setup() {
        String key = UUID.randomUUID().toString().substring(0, 8);
        seller = users.save(User.create(key + "@test.com", "hash", key, "판매자"));
        category = BeanUtils.instantiateClass(Category.class);
        ReflectionTestUtils.setField(category, "name", key);
        em.persist(category);
        em.flush();
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("file", "image.png", "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10});
    }

    private MockMultipartFile data(long price, long categoryId) {
        return new MockMultipartFile("auction", "", "application/json",
                ("{\"title\":\"테스트 물품\",\"description\":\"설명\",\"categoryId\":" + categoryId
                        + ",\"startPrice\":" + price + "}").getBytes(java.nio.charset.StandardCharsets.UTF_8));
    }

    @Test
    void 회원이_등록하면_즉시_시작하고_정확히_24시간_후_마감한다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, category.getId())).file(image())
                        .with(jwt().jwt(token -> token.subject(seller.getId().toString()))))
                .andExpect(status().isCreated()).andExpect(header().exists("Location"))
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"))
                .andExpect(jsonPath("$.currentPrice").value(1000));
        Auction auction = auctions.findAll().getFirst();
        assertEquals(seller.getId(), auction.getUser().getId());
        assertEquals(Duration.ofHours(24), Duration.between(auction.getStartAt(), auction.getEndAt()));
        assertEquals(0, auction.getBidCount());
        assertNotNull(auction.getImage());
        mvc.perform(get("/api/v1/auctions/" + auction.getId())).andExpect(status().isOk())
                .andExpect(jsonPath("$.description").value("설명"));
        mvc.perform(get("/api/v1/auctions")).andExpect(status().isOk())
                .andExpect(jsonPath("$.totalElements").value(1));
    }

    @Test
    void 비회원은_등록하지_못한다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, category.getId())).file(image()))
                .andExpect(status().isUnauthorized());
        assertEquals(0, auctions.count());
    }

    @Test
    void 최소가_미만과_없는_카테고리는_저장하지_않는다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(999, category.getId())).file(image())
                .with(jwt().jwt(token -> token.subject(seller.getId().toString())))).andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, Long.MAX_VALUE)).file(image())
                .with(jwt().jwt(token -> token.subject(seller.getId().toString())))).andExpect(status().isNotFound());
        assertEquals(0, auctions.count());
    }

    @Test
    void 이미지_누락과_위장_파일은_거부한다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, category.getId()))
                .with(jwt().jwt(token -> token.subject(seller.getId().toString())))).andExpect(status().isBadRequest());
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, category.getId()))
                .file(new MockMultipartFile("file", "fake.png", "image/png", new byte[]{1, 2, 3}))
                .with(jwt().jwt(token -> token.subject(seller.getId().toString())))).andExpect(status().isBadRequest());
        assertEquals(0, auctions.count());
    }

    @Test
    void 탈퇴회원은_유효한_토큰이_있어도_등록하지_못한다() throws Exception {
        ReflectionTestUtils.setField(seller, "isDeleted", true);
        em.flush();
        mvc.perform(multipart("/api/v1/auctions").file(data(1000, category.getId())).file(image())
                .with(jwt().jwt(token -> token.subject(seller.getId().toString())))).andExpect(status().isUnauthorized());
    }

    @Test
    void 최대_시작가는_long_범위까지_허용한다() {
        var result = registration.register(seller.getId(),
                new AuctionRegistrationRequest("고가 물품", null, category.getId(), Long.MAX_VALUE), image());
        assertEquals(Long.MAX_VALUE, result.startPrice());
    }

    @Test
    void 무입찰_경매는_마감시_유찰되고_반복처리해도_안전하다() {
        var result = registration.register(seller.getId(),
                new AuctionRegistrationRequest("물품", null, category.getId(), 1000L), image());
        var auction = auctions.findById(result.auctionId()).orElseThrow();
        ReflectionTestUtils.setField(auction, "endAt", LocalDateTime.now().minusSeconds(1));
        em.flush();
        closing.createCandidates(auction.getId());
        closing.createCandidates(auction.getId());
        assertEquals(AuctionStatus.FAILED, auction.getStatus());
    }

    @Test
    void 다른_회원은_이미지를_바꾸지_못한다() throws Exception {
        var result = registration.register(seller.getId(),
                new AuctionRegistrationRequest("물품", null, category.getId(), 1000L), image());
        User other = users.save(User.create("other@test.com", "hash", "other", "다른 회원"));
        mvc.perform(multipart("/api/v1/auctions/" + result.auctionId() + "/image").file(image())
                .with(jwt().jwt(token -> token.subject(other.getId().toString())))).andExpect(status().isForbidden());
    }
}
