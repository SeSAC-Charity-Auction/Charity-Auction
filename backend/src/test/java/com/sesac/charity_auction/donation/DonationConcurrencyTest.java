package com.sesac.charity_auction.donation;

import com.sesac.charity_auction.donation.service.DonationService;
import com.sesac.charity_auction.global.common.exception.BusinessException;
import com.sesac.charity_auction.global.common.exception.ErrorCode;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

/**
 * 7단계: 동시에 여러 번 기부해도 잔액이 마이너스가 되지 않고, 숫자들이 서로 맞는지 증명하는 테스트예요.
 * 스레드 여러 개를 출발선(CountDownLatch)에 세워 두고 한꺼번에 출발시켜서 진짜로 동시에 부딪히게 해요.
 * 실제 DB(MySQL)를 쓰고, 테스트마다 자기 데이터를 만들고 지워요.
 */
@SpringBootTest
class DonationConcurrencyTest {

    final List<Long> userIds = new ArrayList<>();
    @Autowired
    DonationService donationService;
    @Autowired
    JdbcTemplate jdbc;
    long targetId;

    @BeforeEach
    void setUp() {
        jdbc.update("INSERT INTO donation_targets (target_name, is_active, total_donation, target_amount, created_at) "
                + "VALUES ('동시성 테스트 기부처', TRUE, 0, 100000000, UTC_TIMESTAMP())");
        targetId = jdbc.queryForObject(
                "SELECT MAX(target_id) FROM donation_targets WHERE target_name = '동시성 테스트 기부처'", Long.class);
    }

    @AfterEach
    void tearDown() {
        for (long id : userIds) {
            jdbc.update("DELETE FROM point_histories WHERE user_id = ?", id);
            jdbc.update("DELETE FROM donations WHERE user_id = ?", id);
            jdbc.update("DELETE FROM users WHERE user_id = ?", id);
        }
        userIds.clear();
        jdbc.update("DELETE FROM donation_targets WHERE target_id = ?", targetId);
    }

    private long createUser(long balance) {
        String key = UUID.randomUUID().toString().substring(0, 8);
        jdbc.update("INSERT INTO users (password, name, nickname, email, role, point_balance, created_at, updated_at) "
                + "VALUES ('x', '동시성', ?, ?, 'USER', ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())", key, key + "@test.local", balance);
        long id = jdbc.queryForObject("SELECT user_id FROM users WHERE email = ?", Long.class, key + "@test.local");
        userIds.add(id);
        return id;
    }

    /**
     * 모든 작업을 한꺼번에 출발시키고, 성공 횟수와 실패 코드별 횟수를 돌려줘요.
     */
    private Result runConcurrently(final List<Callable<Void>> jobs) throws Exception {
        try (final ExecutorService pool = Executors.newFixedThreadPool(jobs.size())) {
            final CountDownLatch ready = new CountDownLatch(jobs.size());
            final CountDownLatch go = new CountDownLatch(1);
            final List<Future<String>> futures = new ArrayList<>();
            try {
                for (final Callable<Void> job : jobs) {
                    futures.add(pool.submit(() -> {
                        ready.countDown();
                        go.await();                 // 모두 준비될 때까지 기다렸다가
                        try {
                            job.call();
                            return null;            // 성공
                        } catch (final BusinessException e) {
                            return e.getCode() != null ? e.getCode() : "NO_CODE"; // 규칙에 따른 실패 (에러 코드 이름). null이면 성공으로 오해하지 않게 따로 표시해요
                        }
                    }));
                }
                assertThat(ready.await(10, TimeUnit.SECONDS)).isTrue();
                go.countDown();                     // 한꺼번에 출발!

                final Result result = new Result();
                for (final Future<String> f : futures) {
                    final String code = f.get(30, TimeUnit.SECONDS); // 예상 못 한 예외는 여기서 테스트 실패로 드러나요
                    if (code == null) result.success++;
                    else result.failures.merge(code, 1, Integer::sum);
                }
                return result;
            } finally {
                pool.shutdownNow();
            }
        }
    }

    private long balance(final long userId) {
        return jdbc.queryForObject("SELECT point_balance FROM users WHERE user_id = ?", Long.class, userId);
    }

    private long count(final String sql, final Object... args) {
        return jdbc.queryForObject(sql, Long.class, args);
    }

    // 같은 사용자의 20번 동시 요청 중 잔액으로 가능한 10번만 성공해야 해요.
    @RepeatedTest(5)
    void 같은_사용자가_동시에_20번_기부해도_잔액은_정확히_0이고_마이너스가_없다() throws Exception {
        final long userId = createUser(10_000);
        final List<Callable<Void>> jobs = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            jobs.add(() -> {
                donationService.donate(userId, targetId, 1_000L);
                return null;
            });
        }

        final Result r = runConcurrently(jobs);

        assertThat(r.success).isEqualTo(10);
        assertThat(r.failed()).isEqualTo(10);
        assertThat(balance(userId)).isEqualTo(0);                   // 마이너스가 아니에요
        // 성공한 만큼만 기록이 남아야 해요. (잔액·누적액·기부 기록·장부가 서로 맞아요)
        assertThat(count("SELECT total_donation FROM donation_targets WHERE target_id = ?", targetId)).isEqualTo(10_000);
        assertThat(count("SELECT COUNT(*) FROM donations WHERE user_id = ?", userId)).isEqualTo(10);
        assertThat(count("SELECT COUNT(*) FROM point_histories WHERE user_id = ? AND point_type = 'USE'", userId)).isEqualTo(10);
    }

    // 잔액이 딱 떨어지지 않는 경우: 5,500P로 1,000P씩이면 5번만 성공하고 500P가 남아요.
    @Test
    void 잔액이_딱_떨어지지_않아도_남은_잔액은_0이상이다() throws Exception {
        long userId = createUser(5_500);
        final List<Callable<Void>> jobs = new ArrayList<>();
        for (int i = 0; i < 20; i++) {
            jobs.add(() -> {
                donationService.donate(userId, targetId, 1_000L);
                return null;
            });
        }

        final Result r = runConcurrently(jobs);

        assertThat(r.success).isEqualTo(5);
        assertThat(r.failed()).isEqualTo(15);
        assertThat(balance(userId)).isEqualTo(500);
        assertThat(count("SELECT COUNT(*) FROM donations WHERE user_id = ?", userId)).isEqualTo(5);
    }

    // 금액이 서로 다른 요청이 섞여도 총합이 잔액을 넘지 않아야 해요. (100P 단위)
    @Test
    void 금액이_섞여_있어도_쓴_합계는_잔액을_넘지_않는다() throws Exception {
        final long userId = createUser(10_000);
        final long[] amounts = {1_000, 1_500, 2_000, 2_500, 3_000, 3_500, 4_000, 1_200, 1_700, 2_300, 2_900, 3_100};
        final List<Callable<Void>> jobs = new ArrayList<>();
        for (final long a : amounts) {
            jobs.add(() -> {
                donationService.donate(userId, targetId, a);
                return null;
            });
        }

        final Result r = runConcurrently(jobs);

        final long spent = count("SELECT COALESCE(SUM(donation_amount), 0) FROM donations WHERE user_id = ?", userId);
        assertThat(spent).isLessThanOrEqualTo(10_000);
        assertThat(balance(userId)).isEqualTo(10_000 - spent);      // 쓴 만큼만 정확히 빠졌어요
        assertThat(balance(userId)).isGreaterThanOrEqualTo(0);
        assertThat(count("SELECT total_donation FROM donation_targets WHERE target_id = ?", targetId)).isEqualTo(spent);
        assertThat(r.success).isEqualTo((int) count("SELECT COUNT(*) FROM donations WHERE user_id = ?", userId));
    }

    // 여러 사람이 같은 기부처에 동시에 기부해도 누적액이 하나도 사라지지 않아야 해요. (덮어쓰기 방지)
    @Test
    void 여러_사용자가_같은_기부처에_동시에_기부해도_누적액이_정확하다() throws Exception {
        final List<Callable<Void>> jobs = new ArrayList<>();
        for (int u = 0; u < 10; u++) {
            final long userId = createUser(100_000);
            for (int i = 0; i < 3; i++) {   // 한 사람당 3번씩, 총 30번 동시에
                jobs.add(() -> {
                    donationService.donate(userId, targetId, 2_000L);
                    return null;
                });
            }
        }

        final Result r = runConcurrently(jobs);

        assertThat(r.success).isEqualTo(30);
        assertThat(count("SELECT total_donation FROM donation_targets WHERE target_id = ?", targetId)).isEqualTo(60_000);
        assertThat(count("SELECT COUNT(*) FROM donations WHERE target_id = ?", targetId)).isEqualTo(30);
        for (final long id : userIds) {
            assertThat(balance(id)).isEqualTo(94_000);
        }
    }

    static class Result {
        final java.util.Map<String, Integer> failures = new java.util.HashMap<>();
        int success;

        int failed() {
            return failures.getOrDefault(ErrorCode.INSUFFICIENT_POINT.name(), 0);
        }
    }
}
