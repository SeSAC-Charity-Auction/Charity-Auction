package com.sesac.charity_auction.auction;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.domain.AuctionStatus;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
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
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.util.ReflectionTestUtils;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.request.RequestPostProcessor;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.jwt;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:auction-schedule;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver", "spring.datasource.username=sa",
        "spring.datasource.password=", "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false", "spring.flyway.enabled=false",
        "security.jwt.secret=dGhpcy1pcy1hLXRlc3Qtb25seS0zMi1ieXRlLXNlY3JldC1rZXk=",
        "scheduler.auction.enabled=false", "app.upload-dir=${java.io.tmpdir}/charity-schedule-tests"
})
@AutoConfigureMockMvc
@ActiveProfiles("registration-test")
@Transactional
class AuctionScheduleRegistrationTest {
    @Autowired MockMvc mvc;
    @Autowired EntityManager em;
    @Autowired UserRepository users;
    @Autowired AuctionRepository auctions;
    User seller;
    Category category;
    LocalDateTime now;

    @BeforeEach
    void setup() {
        String key = UUID.randomUUID().toString().substring(0, 8);
        seller = users.save(User.create(key + "@test.com", "hash", key, "판매자"));
        category = BeanUtils.instantiateClass(Category.class);
        ReflectionTestUtils.setField(category, "name", key);
        em.persist(category);
        em.flush();
        now = auctions.findCurrentDatabaseTime().truncatedTo(ChronoUnit.SECONDS);
    }

    private RequestPostProcessor asSeller() {
        return jwt().jwt(token -> token.subject(seller.getId().toString()));
    }

    private MockMultipartFile image() {
        return new MockMultipartFile("file", "image.png", "image/png",
                new byte[]{(byte) 0x89, 'P', 'N', 'G', 13, 10, 26, 10});
    }

    private MockMultipartFile data(final LocalDateTime startAt, final LocalDateTime endAt) {
        String json = "{\"title\":\"예약 물품\",\"description\":\"설명\",\"categoryId\":" + category.getId()
                + ",\"startPrice\":1000"
                + (startAt == null ? "" : ",\"startAt\":\"" + startAt + "\"")
                + (endAt == null ? "" : ",\"endAt\":\"" + endAt + "\"") + "}";
        return new MockMultipartFile("auction", "", "application/json", json.getBytes(StandardCharsets.UTF_8));
    }

    @Test
    void 시작_시각을_예약하면_예정_상태로_등록하고_정한_기간을_그대로_저장한다() throws Exception {
        LocalDateTime startAt = now.plusHours(2);
        LocalDateTime endAt = now.plusHours(26);
        mvc.perform(multipart("/api/v1/auctions").file(data(startAt, endAt)).file(image()).with(asSeller()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("SCHEDULED"));
        Auction auction = auctions.findAll().getFirst();
        assertEquals(AuctionStatus.SCHEDULED, auction.getStatus());
        assertEquals(startAt, auction.getStartAt());
        assertEquals(endAt, auction.getEndAt());
    }

    @Test
    void 바로_시작은_마감_시각을_받지_않고_예약은_마감_시각이_필요하다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(null, now.plusHours(3))).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusHours(2), null)).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        assertEquals(0, auctions.count());
    }

    @Test
    void 시각을_정하지_않으면_바로_시작하고_24시간_뒤_마감한다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(null, null)).file(image()).with(asSeller()))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("IN_PROGRESS"));
        Auction auction = auctions.findAll().getFirst();
        assertEquals(java.time.Duration.ofHours(24), java.time.Duration.between(auction.getStartAt(), auction.getEndAt()));
    }

    @Test
    void 지난_시작_시각과_허용_범위를_벗어난_기간은_거절한다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(now.minusMinutes(5), now.plusHours(5))).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusHours(1), now.plusHours(1).plusMinutes(30))).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusHours(1), now.plusDays(8))).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusDays(31), now.plusDays(32))).file(image()).with(asSeller()))
                .andExpect(status().isBadRequest()).andExpect(jsonPath("$.code").value("INVALID_AUCTION_TIME"));
        assertEquals(0, auctions.count());
    }

    @Test
    void 예약_등록한_경매는_시작_전에_판매자가_수정할_수_있다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusHours(2), now.plusHours(26))).file(image()).with(asSeller()))
                .andExpect(status().isCreated());
        Auction auction = auctions.findAll().getFirst();
        String body = "{\"title\":\"수정한 물품\",\"description\":\"새 설명\",\"image\":\"" + auction.getImage() + "\","
                + "\"categoryId\":" + category.getId() + ",\"startPrice\":2000,"
                + "\"startAt\":\"" + now.plusHours(3) + "\",\"endAt\":\"" + now.plusHours(27) + "\"}";
        mvc.perform(put("/api/v1/auctions/" + auction.getId()).contentType(MediaType.APPLICATION_JSON).content(body).with(asSeller()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("수정한 물품"))
                .andExpect(jsonPath("$.startPrice").value(2000));
    }

    @Test
    void 시작_시각이_된_예정_경매만_진행_중으로_바뀐다() throws Exception {
        mvc.perform(multipart("/api/v1/auctions").file(data(now.plusHours(2), now.plusHours(26))).file(image()).with(asSeller()))
                .andExpect(status().isCreated());
        Auction auction = auctions.findAll().getFirst();

        assertEquals(0, auctions.startDueAuctions(now));
        assertEquals(AuctionStatus.SCHEDULED, auctions.findById(auction.getId()).orElseThrow().getStatus());

        assertEquals(1, auctions.startDueAuctions(now.plusHours(2)));
        assertEquals(AuctionStatus.IN_PROGRESS, auctions.findById(auction.getId()).orElseThrow().getStatus());
    }
}
