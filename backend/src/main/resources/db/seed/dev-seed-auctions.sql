-- 개발용 경매 더미 데이터 (카테고리 + 경매 물품). dev-seed.sql(회원 1~17번)을 먼저 넣은 뒤에 넣어요.
--   mysql -uroot auctions < backend/src/main/resources/db/seed/dev-seed-auctions.sql
-- categories와 auctions가 "비어 있을 때만" 쓰세요. 번호가 겹치면 실패하고 아무것도 바꾸지 않아요.
-- 시간은 넣는 시점의 UTC 기준이에요. 이미지는 NULL이라 목록에서는 제목 첫 글자가 대신 보여요.

START TRANSACTION;

INSERT INTO categories (category_id, name) VALUES
(1, '디지털·가전'),
(2, '패션·잡화'),
(3, '도서·음반'),
(4, '생활·주방'),
(5, '스포츠·레저'),
(6, '수집품·기타');

INSERT INTO auctions
    (auction_id, user_id, category_id, title, image, description, start_price, current_price, bid_count,
     start_at, end_at, status, is_deleted, created_at, updated_at) VALUES
-- 진행 중
(1, 2, 1, '미개봉 무선 이어폰', NULL, '선물받았지만 쓰지 않는 새 제품이에요. 낙찰금은 기부돼요.', 30000, 52000, 9,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 HOUR), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 DAY), UTC_TIMESTAMP()),
(2, 3, 2, '빈티지 가죽 크로스백', NULL, '몇 번 들지 않은 소가죽 가방이에요.', 20000, 41000, 6,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY), UTC_TIMESTAMP()),
(3, 4, 3, '추리소설 전집 20권', NULL, '깨끗하게 읽은 전집이에요.', 10000, 10000, 0,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 HOUR), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP()),
(4, 5, 4, '무쇠 주물 냄비 세트', NULL, '길들여 둔 무쇠 냄비 3종이에요.', 25000, 38000, 4,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 5 DAY), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 DAY), UTC_TIMESTAMP()),
(5, 6, 5, '캠핑 릴렉스 체어 2개', NULL, '한 시즌 사용했어요.', 15000, 27000, 5,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 20 MINUTE), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY), UTC_TIMESTAMP()),
(6, 7, 6, '1990년대 우표 수집첩', NULL, '상태 좋은 우표 120장이에요.', 40000, 88000, 14,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5 DAY), UTC_TIMESTAMP()),
(7, 8, 1, '중고 태블릿 10인치', NULL, '화면 보호필름 부착 상태예요.', 120000, 165000, 11,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 8 HOUR), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3 DAY), UTC_TIMESTAMP()),
(8, 9, 2, '울 머플러와 장갑 세트', NULL, '새것 같은 상태예요.', 8000, 14000, 3,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 4 DAY), 'IN_PROGRESS', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2 DAY), UTC_TIMESTAMP()),
-- 예정
(9, 10, 3, '클래식 LP 음반 모음', NULL, 'LP 15장이에요.', 50000, 50000, 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 4 DAY), 'SCHEDULED', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP()),
(10, 11, 5, '요가 매트와 폼롤러', NULL, '거의 쓰지 않았어요.', 10000, 10000, 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 6 HOUR), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 DAY), 'SCHEDULED', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP()),
(11, 12, 4, '핸드드립 커피 도구 세트', NULL, '드리퍼, 서버, 주전자 세트예요.', 20000, 20000, 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 2 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 6 DAY), 'SCHEDULED', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP()),
-- 종료·취소·삭제 (기본 목록에는 나오지 않아요)
(12, 13, 1, '종료된 경매 예시', NULL, NULL, 10000, 33000, 7,
 DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6 DAY), DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), 'COMPLETED', 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7 DAY), UTC_TIMESTAMP()),
(13, 14, 2, '삭제된 경매 예시', NULL, NULL, 10000, 10000, 0,
 DATE_ADD(UTC_TIMESTAMP(), INTERVAL 1 DAY), DATE_ADD(UTC_TIMESTAMP(), INTERVAL 3 DAY), 'SCHEDULED', 1, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1 DAY), UTC_TIMESTAMP());

COMMIT;
