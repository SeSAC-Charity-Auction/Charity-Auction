package com.sesac.charity_auction.bid;

import com.sesac.charity_auction.auction.domain.Auction;
import com.sesac.charity_auction.auction.repository.AuctionRepository;
import com.sesac.charity_auction.bid.dto.request.BidCreateRequest;
import com.sesac.charity_auction.bid.repository.BidRepository;
import com.sesac.charity_auction.bid.service.BidService;
import com.sesac.charity_auction.global.exception.BusinessException;
import com.sesac.charity_auction.global.exception.ErrorCode;
import com.sesac.charity_auction.user.repository.UserRepository;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.RepeatedTest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.transaction.PlatformTransactionManager;
import org.springframework.transaction.support.TransactionTemplate;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.*;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest
class BidConcurrencyTest {

    @Autowired
    private BidService bidService;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionRepository auctionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JdbcTemplate jdbc;

    @Autowired
    private PlatformTransactionManager transactionManager;

    private TransactionTemplate transactionTemplate;

    private final List<Long> userIds = new ArrayList<>();

    private Long auctionId;

    private Long categoryId;

    @BeforeEach
    void setUp() {
        transactionTemplate = new TransactionTemplate(transactionManager);
    }

    // 테스트 종료 후 생성 데이터 삭제
    @AfterEach
    void tearDown() {

        transactionTemplate.executeWithoutResult(status -> {

            if (auctionId != null) {
                bidRepository.deleteAllByAuction_Id(auctionId);
                auctionRepository.deleteById(auctionId);
            }

            for (Long userId : userIds) {
                userRepository.deleteById(userId);
            }
        });

        // 테스트에서 직접 만든 카테고리 삭제 (기존 카테고리는 그대로)
        if (categoryId != null) {
            jdbc.update("DELETE FROM categories WHERE category_id = ?", categoryId);
            categoryId = null;
        }

        userIds.clear();
        auctionId = null;
    }

    // 테스트 사용자 생성
    private long createUser(String prefix) {

        String key = prefix + "-"
                + UUID.randomUUID().toString().substring(0, 8);

        String email = key + "@test.com";

        jdbc.update(
                "INSERT INTO users " +
                        "(password, name, nickname, email, role, " +
                        "point, created_at, updated_at) " +
                        "VALUES (?, ?, ?, ?, ?, ?, UTC_TIMESTAMP(), UTC_TIMESTAMP())",
                "test1234",
                "동시성테스트",
                key,
                email,
                "USER",
                100000L
        );

        Long userId = jdbc.queryForObject(
                "SELECT user_id FROM users WHERE email = ?",
                Long.class,
                email
        );

        userIds.add(userId);

        return userId;
    }

    // 경매에 필요한 카테고리. 이미 있으면 그걸 쓰고, 없으면 테스트용으로 생성
    private long categoryId() {

        List<Long> ids = jdbc.queryForList(
                "SELECT category_id FROM categories ORDER BY category_id LIMIT 1",
                Long.class
        );

        if (!ids.isEmpty()) {
            return ids.get(0);
        }

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {
            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO categories (category_name) VALUES (?)",
                    Statement.RETURN_GENERATED_KEYS
            );
            ps.setString(1, "동시성테스트-" + UUID.randomUUID().toString().substring(0, 8));
            return ps;
        }, keyHolder);

        categoryId = Objects.requireNonNull(keyHolder.getKey()).longValue();

        return categoryId;
    }

    private long createAuction(
            long sellerId,
            long startPrice,
            long currentPrice
    ) {

        LocalDateTime now = LocalDateTime.now();

        LocalDateTime startAt = now.minusMinutes(1);
        LocalDateTime endAt = now.plusDays(1);

        long categoryId = categoryId();

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbc.update(connection -> {

            PreparedStatement ps = connection.prepareStatement(
                    "INSERT INTO auctions " +
                            "(item_name, item_image, description, start_price, " +
                            "current_price, bid_count, start_at, end_at, " +
                            "status, is_deleted, deleted_at, user_id, " +
                            "created_at, updated_at, category_id) " +
                            "VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                    Statement.RETURN_GENERATED_KEYS
            );

            ps.setString(1, "동시성 테스트 경매");
            ps.setString(2, null);
            ps.setString(3, "동시성 테스트용 경매입니다.");
            ps.setLong(4, startPrice);
            ps.setLong(5, currentPrice);
            ps.setLong(6, 0L);
            ps.setTimestamp(7, Timestamp.valueOf(startAt));
            ps.setTimestamp(8, Timestamp.valueOf(endAt));

            // AuctionStatus 실제 enum 값
            ps.setString(9, "IN_PROGRESS");

            ps.setBoolean(10, false);
            ps.setTimestamp(11, null);
            ps.setLong(12, sellerId);

            ps.setTimestamp(13, Timestamp.valueOf(now));
            ps.setTimestamp(14, Timestamp.valueOf(now));
            ps.setLong(15, categoryId);

            return ps;

        }, keyHolder);

        Number key = keyHolder.getKey();

        if (key == null) {
            throw new IllegalStateException(
                    "경매 ID 생성에 실패했습니다."
            );
        }

        return key.longValue();
    }

    // 테스트용 경매 및 사용자 생성
    private TestFixture createFixture(
            int bidderCount,
            long startPrice,
            long currentPrice
    ) {

        long sellerId = createUser("seller");

        List<Long> bidderIds = new ArrayList<>();

        for (int i = 0; i < bidderCount; i++) {
            bidderIds.add(createUser("bidder" + i));
        }

        long createdAuctionId = createAuction(
                sellerId,
                startPrice,
                currentPrice
        );

        auctionId = createdAuctionId;

        return new TestFixture(
                createdAuctionId,
                bidderIds
        );
    }

    // 모든 입찰 요청을 동시에 실행
    private Result runConcurrently(
            List<Callable<Void>> jobs
    ) throws Exception {

        ExecutorService pool =
                Executors.newFixedThreadPool(jobs.size());

        CountDownLatch ready =
                new CountDownLatch(jobs.size());

        CountDownLatch go =
                new CountDownLatch(1);

        List<Future<String>> futures = new ArrayList<>();

        try {

            for (Callable<Void> job : jobs) {

                futures.add(pool.submit(() -> {

                    ready.countDown();

                    go.await();

                    try {

                        job.call();

                        return null;

                    } catch (BusinessException e) {

                        return e.getErrorCode() != null
                                ? e.getErrorCode().name()
                                : "NO_CODE";
                    }
                }));
            }

            assertThat(
                    ready.await(10, TimeUnit.SECONDS)
            ).isTrue();

            go.countDown();

            Result result = new Result();

            for (Future<String> future : futures) {

                String errorCode =
                        future.get(30, TimeUnit.SECONDS);

                if (errorCode == null) {

                    result.success++;

                } else {

                    result.failures.merge(
                            errorCode,
                            1,
                            Integer::sum
                    );
                }
            }

            return result;

        } finally {

            go.countDown();

            pool.shutdownNow();

            assertThat(
                    pool.awaitTermination(
                            10,
                            TimeUnit.SECONDS
                    )
            ).isTrue();
        }
    }

    // 경매 조회
    private Auction findAuction() {

        return auctionRepository.findById(auctionId)
                .orElseThrow();
    }

    // 실제 입찰 내역 개수 조회
    private long bidCount() {

        return jdbc.queryForObject(
                "SELECT COUNT(*) FROM bids WHERE auction_id = ?",
                Long.class,
                auctionId
        );
    }

    // ==================================================
    // 테스트 1. 동일한 금액으로 동시에 입찰
    // ==================================================

    @RepeatedTest(10)
    void 동시에_같은_금액으로_입찰하면_하나만_성공한다()
            throws Exception {

        // given
        TestFixture fixture = createFixture(
                2,
                10000L,
                10000L
        );

        List<Callable<Void>> jobs = new ArrayList<>();

        for (long userId : fixture.userIds()) {

            jobs.add(() -> {

                bidService.createBid(
                        fixture.auctionId(),
                        userId,
                        new BidCreateRequest(20000L)
                );

                return null;
            });
        }

        // when
        Result result = runConcurrently(jobs);

        // then
        assertThat(result.success).isEqualTo(1);

        assertThat(result.failed()).isEqualTo(1);

        assertThat(result.failures)
                .containsOnlyKeys(
                        ErrorCode.BID_PRICE_TOO_LOW.name()
                );

        Auction auction = findAuction();

        assertThat(auction.getCurrentPrice())
                .isEqualTo(20000L);

        assertThat(auction.getBidCount())
                .isEqualTo(1L);

        assertThat(bidCount())
                .isEqualTo(1L);
    }

    // ==================================================
    // 테스트 2. 서로 다른 금액으로 동시에 입찰
    // ==================================================

    @RepeatedTest(10)
    void 서로_다른_금액으로_동시에_입찰해도_최고가가_유지된다()
            throws Exception {

        // given
        TestFixture fixture = createFixture(
                5,
                10000L,
                10000L
        );

        long[] amounts = {
                15000L,
                20000L,
                25000L,
                30000L,
                35000L
        };

        List<Callable<Void>> jobs = new ArrayList<>();

        for (int i = 0; i < amounts.length; i++) {

            final long userId = fixture.userIds().get(i);
            final long amount = amounts[i];

            jobs.add(() -> {

                bidService.createBid(
                        fixture.auctionId(),
                        userId,
                        new BidCreateRequest(amount)
                );

                return null;
            });
        }

        // when
        Result result = runConcurrently(jobs);

        // then
        Auction auction = findAuction();

        // 최소 한 건 이상 성공
        assertThat(result.success)
                .isGreaterThanOrEqualTo(1);

        // 모든 요청의 결과 확인
        assertThat(result.success + result.failed())
                .isEqualTo(5);

        // 실패 원인은 입찰 금액 부족이어야 함
        assertThat(result.failures)
                .containsOnlyKeys(
                        ErrorCode.BID_PRICE_TOO_LOW.name()
                );

        // 최고가는 항상 가장 높은 금액이어야 함
        assertThat(auction.getCurrentPrice())
                .isEqualTo(35000L);

        // 경매 입찰 횟수와 성공 횟수 비교
        assertThat(auction.getBidCount())
                .isEqualTo((long) result.success);

        // 실제 DB 입찰 내역과 성공 횟수 비교
        assertThat(bidCount())
                .isEqualTo((long) result.success);
    }

    // ==================================================
    // 테스트 3. 여러 사용자가 동시에 입찰
    // ==================================================

    @RepeatedTest(10)
    void 여러_사용자가_동시에_입찰해도_최고가와_입찰횟수가_정확하다()
            throws Exception {

        // given
        TestFixture fixture = createFixture(
                10,
                10000L,
                10000L
        );

        List<Callable<Void>> jobs = new ArrayList<>();

        for (int i = 0; i < 10; i++) {

            final long userId = fixture.userIds().get(i);

            final long amount =
                    20000L + (i * 5000L);

            jobs.add(() -> {

                bidService.createBid(
                        fixture.auctionId(),
                        userId,
                        new BidCreateRequest(amount)
                );

                return null;
            });
        }

        // when
        Result result = runConcurrently(jobs);

        // then
        Auction auction = findAuction();

        assertThat(result.success)
                .isGreaterThanOrEqualTo(1);

        assertThat(result.success + result.failed())
                .isEqualTo(10);

        assertThat(result.failures)
                .containsOnlyKeys(
                        ErrorCode.BID_PRICE_TOO_LOW.name()
                );

        assertThat(auction.getCurrentPrice())
                .isEqualTo(65000L);

        assertThat(auction.getBidCount())
                .isEqualTo((long) result.success);

        assertThat(bidCount())
                .isEqualTo((long) result.success);
    }

    // ==================================================
    // 테스트 데이터 클래스
    // ==================================================

    private record TestFixture(
            Long auctionId,
            List<Long> userIds
    ) {
    }

    // ==================================================
    // 테스트 결과 클래스
    // ==================================================

    static class Result {

        final Map<String, Integer> failures =
                new HashMap<>();

        int success;

        int failed() {

            return failures.getOrDefault(
                    ErrorCode.BID_PRICE_TOO_LOW.name(),
                    0
            );
        }
    }
}
