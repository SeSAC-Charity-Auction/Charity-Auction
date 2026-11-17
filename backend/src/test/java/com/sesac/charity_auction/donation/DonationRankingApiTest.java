package com.sesac.charity_auction.donation;

import com.sesac.charity_auction.donation.domain.Donation;
import com.sesac.charity_auction.donation.domain.DonationTarget;
import com.sesac.charity_auction.donation.repository.DonationRepository;
import com.sesac.charity_auction.donation.repository.DonationTargetRepository;
import com.sesac.charity_auction.point.domain.PointHistory;
import com.sesac.charity_auction.point.repository.PointHistoryRepository;
import com.sesac.charity_auction.user.entity.User;
import com.sesac.charity_auction.user.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "spring.datasource.url=jdbc:h2:mem:donation-ranking-test;MODE=MySQL;DB_CLOSE_DELAY=-1",
        "spring.datasource.driver-class-name=org.h2.Driver",
        "spring.datasource.username=sa",
        "spring.datasource.password=",
        "spring.jpa.hibernate.ddl-auto=create-drop",
        "spring.jpa.show-sql=false",
        "spring.flyway.enabled=false",
        "security.jwt.secret=dGhpcy1pcy1hLXRlc3Qtb25seS0zMi1ieXRlLXNlY3JldC1rZXk=",
        "scheduler.auction.enabled=false"
})
@AutoConfigureMockMvc
@ActiveProfiles("ranking-test")
@Transactional
class DonationRankingApiTest {
    @Autowired
    MockMvc mockMvc;
    @Autowired
    UserRepository userRepository;
    @Autowired
    DonationTargetRepository targetRepository;
    @Autowired
    DonationRepository donationRepository;
    @Autowired
    PointHistoryRepository pointHistoryRepository;
    @Autowired
    JdbcTemplate jdbc;

    private int memberSequence;

    @Test
    void 기부_기록이_없으면_로그인없이_빈_목록을_조회한다() throws Exception {
        createUser();

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(0));
    }

    @Test
    void 회원별_기부포인트를_합산하고_잔액과_무관하게_큰금액순으로_조회한다() throws Exception {
        User first = createUser();
        first.changeImage("/uploads/profiles/ranking-test.png");
        User second = createUser();
        addDonation(first, 1_000);
        addDonation(first, 2_500);
        addDonation(second, 3_000);
        jdbc.update("UPDATE users SET point_balance = 1000000 WHERE user_id = ?", second.getId());

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(2))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].userId").value(first.getId()))
                .andExpect(jsonPath("$[0].nickname").value(first.getNickname()))
                .andExpect(jsonPath("$[0].userImage").value("/uploads/profiles/ranking-test.png"))
                .andExpect(jsonPath("$[0].totalDonation").value(3_500))
                .andExpect(jsonPath("$[0].donationCount").value(2))
                .andExpect(jsonPath("$[0].email").doesNotExist())
                .andExpect(jsonPath("$[0].name").doesNotExist())
                .andExpect(jsonPath("$[0].password").doesNotExist())
                .andExpect(jsonPath("$[1].userId").value(second.getId()))
                .andExpect(jsonPath("$[1].totalDonation").value(3_000));
    }

    @Test
    void 적립과_경매구매는_제외하고_포인트장부의_기부사용만_집계한다() throws Exception {
        User donor = createUser();
        User nonDonor = createUser();
        Donation donation = addDonation(donor, 1_000);

        addOtherHistory(donor, 50_000, "EARN", null);
        addOtherHistory(donor, 20_000, "USE", null);
        addOtherHistory(nonDonor, 80_000, "EARN", null);
        addOtherHistory(nonDonor, 10_000, "USE", null);
        addOtherHistory(donor, 90_000, "EARN", donation.getId());
        donationRepository.save(new Donation(donation.getTarget(), donor, 100_000));

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].userId").value(donor.getId()))
                .andExpect(jsonPath("$[0].totalDonation").value(1_000))
                .andExpect(jsonPath("$[0].donationCount").value(1));
    }

    @Test
    void 동점은_같은순위를_주고_다음순위를_건너뛰며_동점내에서는_회원번호순이다() throws Exception {
        User top = createUser();
        User tieFirst = createUser();
        User tieSecond = createUser();
        User last = createUser();
        addDonation(top, 5_000);
        addDonation(tieSecond, 3_000);
        addDonation(tieFirst, 1_000);
        addDonation(tieFirst, 2_000);
        addDonation(last, 1_000);

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(4))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[1].rank").value(2))
                .andExpect(jsonPath("$[2].rank").value(2))
                .andExpect(jsonPath("$[3].rank").value(4))
                .andExpect(jsonPath("$[1].userId").value(tieFirst.getId()))
                .andExpect(jsonPath("$[2].userId").value(tieSecond.getId()));
    }

    @Test
    void 탈퇴한_회원은_기부기록이_있어도_공개랭킹에서_제외한다() throws Exception {
        User withdrawn = createUser();
        User active = createUser();
        addDonation(withdrawn, 10_000);
        addDonation(active, 1_000);
        withdrawn.withdraw();

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.length()").value(1))
                .andExpect(jsonPath("$[0].rank").value(1))
                .andExpect(jsonPath("$[0].userId").value(active.getId()));
    }

    @Test
    void 누적금액이_int_범위를_넘어도_long으로_조회한다() throws Exception {
        User donor = createUser();
        addDonation(donor, 3_000_000_000L);
        addDonation(donor, 2_000_000_000L);

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].totalDonation").value(5_000_000_000L))
                .andExpect(jsonPath("$[0].donationCount").value(2));
    }

    @Test
    void 새로운_기부사용내역이_생기면_다음조회에_금액과_순위가_반영된다() throws Exception {
        User first = createUser();
        User second = createUser();
        addDonation(first, 1_000);
        addDonation(second, 2_000);

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(second.getId()));

        addDonation(first, 3_000);

        mockMvc.perform(get("/api/donations/ranking"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[0].userId").value(first.getId()))
                .andExpect(jsonPath("$[0].totalDonation").value(4_000))
                .andExpect(jsonPath("$[0].donationCount").value(2))
                .andExpect(jsonPath("$[1].rank").value(2));
    }

    private User createUser() {
        memberSequence++;
        return userRepository.save(User.create(
                UUID.randomUUID() + "@ranking.test", "test-only-hash",
                "rank" + memberSequence, "기부테스터"
        ));
    }

    private Donation addDonation(User user, long amount) {
        DonationTarget target = targetRepository.save(new DonationTarget("랭킹 테스트", null, null, 10_000_000));
        Donation donation = donationRepository.save(new Donation(target, user, amount));
        pointHistoryRepository.save(PointHistory.usedForDonation(user, donation, amount));
        return donation;
    }

    private void addOtherHistory(User user, long amount, String type, Long donationId) {
        jdbc.update("INSERT INTO point_histories (user_id, auction_id, donation_id, point_amount, point_type, created_at) "
                        + "VALUES (?, NULL, ?, ?, ?, ?)",
                user.getId(), donationId, amount, type, Timestamp.valueOf(LocalDateTime.now(ZoneOffset.UTC)));
    }
}
