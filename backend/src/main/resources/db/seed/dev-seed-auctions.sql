-- 개발용 경매 더미 데이터 (카테고리 + 경매 물품 + 입찰 내역 + 낙찰 후보). dev-seed.sql(회원 1~17번)을 먼저 넣은 뒤에 넣어요.
--   mysql -uroot auctions < backend/src/main/resources/db/seed/dev-seed-auctions.sql
-- categories, auctions, bids, auction_candidates가 "비어 있을 때만" 쓰세요. 번호가 겹치면 실패하고 아무것도 바꾸지 않아요.
-- 시간은 넣는 시점의 서버 현지 시간(NOW()) 기준이에요. 경매·입찰 코드가 현지 시간(LocalDateTime.now, CURRENT_TIMESTAMP)으로 시간을 비교하기 때문이에요. 이미지는 NULL이라 목록에서는 제목 첫 글자가 대신 보여요.

START TRANSACTION;

-- V6 마이그레이션이 '기타'를 1번으로 미리 만들어 두므로, 같은 번호가 있으면 이름을 덮어써서 맞춰요. ('기타'는 7번으로 다시 만들어요.)
INSERT INTO categories (category_id, category_name) VALUES
(1, '디지털·가전'),
(2, '패션·잡화'),
(3, '도서·음반'),
(4, '생활·주방'),
(5, '스포츠·레저'),
(6, '수집품·기타')
ON DUPLICATE KEY UPDATE category_name = VALUES(category_name);

INSERT IGNORE INTO categories (category_id, category_name) VALUES (7, '기타');

INSERT INTO auctions
    (auction_id, user_id, category_id, item_name, item_image, description, start_price, current_price, bid_count,
     start_at, end_at, status, is_deleted, created_at, updated_at) VALUES
-- 진행 중
(1, 2, 1, '미개봉 무선 이어폰', NULL, '선물받았지만 쓰지 않는 새 제품이에요. 낙찰금은 기부돼요.', 30000, 52000, 9,
 DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 3 HOUR), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(2, 3, 2, '빈티지 가죽 크로스백', NULL, '몇 번 들지 않은 소가죽 가방이에요.', 20000, 41000, 6,
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 1 DAY), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(3, 4, 3, '추리소설 전집 20권', NULL, '깨끗하게 읽은 전집이에요.', 10000, 10000, 0,
 DATE_SUB(NOW(), INTERVAL 5 HOUR), DATE_ADD(NOW(), INTERVAL 2 DAY), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(4, 5, 4, '무쇠 주물 냄비 세트', NULL, '길들여 둔 무쇠 냄비 3종이에요.', 25000, 38000, 4,
 DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_ADD(NOW(), INTERVAL 5 DAY), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(5, 6, 5, '캠핑 릴렉스 체어 2개', NULL, '한 시즌 사용했어요.', 15000, 27000, 5,
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 20 MINUTE), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(6, 7, 6, '1990년대 우표 수집첩', NULL, '상태 좋은 우표 120장이에요.', 40000, 88000, 14,
 DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_ADD(NOW(), INTERVAL 2 DAY), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(7, 8, 1, '중고 태블릿 10인치', NULL, '화면 보호필름 부착 상태예요.', 120000, 165000, 11,
 DATE_SUB(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 8 HOUR), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(8, 9, 2, '울 머플러와 장갑 세트', NULL, '새것 같은 상태예요.', 8000, 14000, 3,
 DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'IN_PROGRESS', 0, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
-- 예정
(9, 10, 3, '클래식 LP 음반 모음', NULL, 'LP 15장이에요.', 50000, 50000, 0,
 DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 4 DAY), 'SCHEDULED', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(10, 11, 5, '요가 매트와 폼롤러', NULL, '거의 쓰지 않았어요.', 10000, 10000, 0,
 DATE_ADD(NOW(), INTERVAL 6 HOUR), DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(11, 12, 4, '핸드드립 커피 도구 세트', NULL, '드리퍼, 서버, 주전자 세트예요.', 20000, 20000, 0,
 DATE_ADD(NOW(), INTERVAL 2 DAY), DATE_ADD(NOW(), INTERVAL 6 DAY), 'SCHEDULED', 0, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
-- 종료·취소·삭제 (기본 목록에는 나오지 않아요)
(12, 13, 1, '종료된 경매 예시', NULL, NULL, 10000, 33000, 7,
 DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 1 DAY), 'COMPLETED', 0, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(13, 14, 2, '삭제된 경매 예시', NULL, NULL, 10000, 10000, 0,
 DATE_ADD(NOW(), INTERVAL 1 DAY), DATE_ADD(NOW(), INTERVAL 3 DAY), 'SCHEDULED', 1, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- 입찰 내역: 경매마다 auctions.bid_count와 같은 수만큼, 가격이 오르는 순서로 넣었어요. 마지막 입찰가가 current_price예요.
INSERT INTO bids (bid_id, auction_id, user_id, bid_price, bid_at) VALUES
(1, 1, 13, 32400, DATE_SUB(NOW(), INTERVAL 810 MINUTE)),
(2, 1, 14, 34900, DATE_SUB(NOW(), INTERVAL 720 MINUTE)),
(3, 1, 15, 37300, DATE_SUB(NOW(), INTERVAL 630 MINUTE)),
(4, 1, 16, 39800, DATE_SUB(NOW(), INTERVAL 540 MINUTE)),
(5, 1, 17, 42200, DATE_SUB(NOW(), INTERVAL 450 MINUTE)),
(6, 1, 13, 44700, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(7, 1, 14, 47100, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(8, 1, 15, 49600, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(9, 1, 16, 52000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(10, 2, 13, 23500, DATE_SUB(NOW(), INTERVAL 540 MINUTE)),
(11, 2, 14, 27000, DATE_SUB(NOW(), INTERVAL 450 MINUTE)),
(12, 2, 15, 30500, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(13, 2, 16, 34000, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(14, 2, 17, 37500, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(15, 2, 13, 41000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(16, 4, 13, 28200, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(17, 4, 14, 31500, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(18, 4, 15, 34800, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(19, 4, 16, 38000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(20, 5, 13, 17400, DATE_SUB(NOW(), INTERVAL 450 MINUTE)),
(21, 5, 14, 19800, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(22, 5, 15, 22200, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(23, 5, 16, 24600, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(24, 5, 17, 27000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(25, 6, 13, 43400, DATE_SUB(NOW(), INTERVAL 1260 MINUTE)),
(26, 6, 14, 46900, DATE_SUB(NOW(), INTERVAL 1170 MINUTE)),
(27, 6, 15, 50300, DATE_SUB(NOW(), INTERVAL 1080 MINUTE)),
(28, 6, 16, 53700, DATE_SUB(NOW(), INTERVAL 990 MINUTE)),
(29, 6, 17, 57100, DATE_SUB(NOW(), INTERVAL 900 MINUTE)),
(30, 6, 13, 60600, DATE_SUB(NOW(), INTERVAL 810 MINUTE)),
(31, 6, 14, 64000, DATE_SUB(NOW(), INTERVAL 720 MINUTE)),
(32, 6, 15, 67400, DATE_SUB(NOW(), INTERVAL 630 MINUTE)),
(33, 6, 16, 70900, DATE_SUB(NOW(), INTERVAL 540 MINUTE)),
(34, 6, 17, 74300, DATE_SUB(NOW(), INTERVAL 450 MINUTE)),
(35, 6, 13, 77700, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(36, 6, 14, 81100, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(37, 6, 15, 84600, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(38, 6, 16, 88000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(39, 7, 13, 124100, DATE_SUB(NOW(), INTERVAL 990 MINUTE)),
(40, 7, 14, 128200, DATE_SUB(NOW(), INTERVAL 900 MINUTE)),
(41, 7, 15, 132300, DATE_SUB(NOW(), INTERVAL 810 MINUTE)),
(42, 7, 16, 136400, DATE_SUB(NOW(), INTERVAL 720 MINUTE)),
(43, 7, 17, 140500, DATE_SUB(NOW(), INTERVAL 630 MINUTE)),
(44, 7, 13, 144500, DATE_SUB(NOW(), INTERVAL 540 MINUTE)),
(45, 7, 14, 148600, DATE_SUB(NOW(), INTERVAL 450 MINUTE)),
(46, 7, 15, 152700, DATE_SUB(NOW(), INTERVAL 360 MINUTE)),
(47, 7, 16, 156800, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(48, 7, 17, 160900, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(49, 7, 13, 165000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(50, 8, 13, 10000, DATE_SUB(NOW(), INTERVAL 270 MINUTE)),
(51, 8, 14, 12000, DATE_SUB(NOW(), INTERVAL 180 MINUTE)),
(52, 8, 15, 14000, DATE_SUB(NOW(), INTERVAL 90 MINUTE)),
(53, 12, 14, 13300, DATE_SUB(NOW(), INTERVAL 45 HOUR)),
(54, 12, 15, 16600, DATE_SUB(NOW(), INTERVAL 42 HOUR)),
(55, 12, 16, 19900, DATE_SUB(NOW(), INTERVAL 39 HOUR)),
(56, 12, 17, 23100, DATE_SUB(NOW(), INTERVAL 36 HOUR)),
(57, 12, 1, 26400, DATE_SUB(NOW(), INTERVAL 33 HOUR)),
(58, 12, 14, 29700, DATE_SUB(NOW(), INTERVAL 30 HOUR)),
(59, 12, 15, 33000, DATE_SUB(NOW(), INTERVAL 27 HOUR));

-- 낙찰 후보: 종료된 12번 경매만 있어요. 입찰한 사람별 최고가를 높은 순으로 1순위(낙찰 완료)부터 줄 세웠어요.
INSERT INTO auction_candidates (auction_id, bid_id, user_id, candidate_rank, bid_price, status, offered_at, deadline_at, processed_at) VALUES
(12, 59, 15, 1, 33000, 'COMPLETED', DATE_SUB(NOW(), INTERVAL 25 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR), DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(12, 58, 14, 2, 29700, 'NOT_SELECTED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(12, 57, 1, 3, 26400, 'NOT_SELECTED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(12, 56, 17, 4, 23100, 'NOT_SELECTED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR)),
(12, 55, 16, 5, 19900, 'NOT_SELECTED', NULL, NULL, DATE_SUB(NOW(), INTERVAL 24 HOUR));

-- 낙찰 포인트: 종료된 12번 경매의 낙찰가 33,000원을 반으로 나눠, 낙찰자(15번 회원)가 50%를 받았어요. (장부와 잔액 모두)
INSERT INTO point_histories (auction_id, user_id, point_amount, point_type, created_at)
VALUES (12, 15, 16500, 'EARN', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR));
UPDATE users SET point = point + 16500 WHERE user_id = 15;
-- 판매자(13번 회원)도 나머지 50%를 받았어요.
INSERT INTO point_histories (auction_id, user_id, point_amount, point_type, created_at)
VALUES (12, 13, 16500, 'EARN', DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24 HOUR));
UPDATE users SET point = point + 16500 WHERE user_id = 13;

COMMIT;
