-- 개발용 기부처 추가분 (기부처 10곳 + 기부 내역 65건). dev-seed.sql(회원 1~17번, 기부처 1~5번) 뒤에 넣어요.
-- 기부처 번호는 6~15번, 기부 번호는 300번~를 써서 겹치지 않아요. 각 기부처의 total_donation은 기부 내역의 합과 같아요.
-- 시간은 UTC 기준이에요. 기부처 이미지는 NULL이라 목록에서는 첫 글자가 대신 보여요.

START TRANSACTION;

INSERT INTO donation_targets (target_id, target_name, description, target_image, is_active, total_donation, target_amount, is_achieved, created_at) VALUES
(6, '햇살 지역아동센터', '맞벌이와 한부모 가정 아이들이 방과 후에 따뜻한 밥과 안전한 공부방을 누릴 수 있도록 지원해요.

[이런 일을 해요]
· 초등학생 35명이 학교가 끝나면 센터에서 간식과 저녁을 먹어요.
· 선생님과 대학생 자원봉사자가 숙제와 독서를 함께 봐줘요.
· 방학에는 체험학습과 캠프를 열어 아이들에게 새로운 경험을 만들어줘요.

[기부금은 이렇게 쓰여요]
(목표 금액 8,000,000원)
· 저녁 급식비 1년분: 3,600,000원
· 학습 교재와 놀이 교구: 2,000,000원
· 체험학습과 방학 캠프: 2,400,000원

[지금 상황]
센터 급식 지원금이 해마다 줄어서 올해는 저녁 급식을 주 3회로 줄여야 할 상황이에요. 매일 따뜻한 밥을 먹을 수 있게 힘을 보태 주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 3240000, 8000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 21 DAY)),
(7, '바람길 이동권 지원', '휠체어와 보조기기를 쓰는 분들이 병원과 학교, 일터에 편하게 다닐 수 있는 이동 지원 차량을 운영해요.

[이런 일을 해요]
· 휠체어 리프트가 있는 차량으로 병원, 복지관, 직장까지 오가는 길을 안내해요.
· 운전 자원봉사자와 동행 도우미가 문 앞에서 문 앞까지 함께해요.
· 지하철과 버스 이용이 어려운 분들을 위해 이동 상담을 열어요.

[기부금은 이렇게 쓰여요]
(목표 금액 12,000,000원)
· 차량 유지와 정비: 4,200,000원
· 연료비와 보험료: 3,600,000원
· 운전·동행 자원봉사자 교육과 교통비: 4,200,000원

[지금 상황]
저상버스가 닿지 않는 지역에서는 하루 한 번 외출도 큰 결심이 필요해요. 병원에 가는 길이 두렵지 않도록 도와주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 7920000, 12000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 35 DAY)),
(8, '초록손 숲 가꾸기', '산불로 상한 마을 뒷산에 나무를 심고, 도시 아이들이 숲을 경험하도록 숲 체험을 이어가요.

[이런 일을 해요]
· 봄과 가을에 지역 주민과 함께 묘목을 심고 가꿔요.
· 숲 해설가와 함께 아이들이 숲을 걷고 생태를 배우는 체험을 열어요.
· 심은 나무에 이름표를 달아 해마다 자라는 모습을 기록해요.

[기부금은 이렇게 쓰여요]
(목표 금액 6,000,000원)
· 묘목 구입과 식재 작업: 3,000,000원
· 숲 체험 프로그램 운영: 1,800,000원
· 나무 관리와 물주기 장비: 1,200,000원

[지금 상황]
산불로 까맣게 탄 산비탈이 아직 그대로예요. 나무 한 그루가 숲이 되기까지는 오랜 시간이 걸리지만 지금 심어야 해요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 1380000, 6000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 28 DAY)),
(9, '온기 한부모 가정 지원', '혼자 아이를 키우는 부모님이 갑작스러운 어려움을 만났을 때 생계와 주거를 버틸 수 있도록 도와요.

[이런 일을 해요]
· 월세와 공과금이 밀린 가정에 긴급 생계비를 지원해요.
· 아이 학원비와 교재비가 부담되는 가정에 교육비를 일부 지원해요.
· 한부모 가정끼리 육아 정보를 나누는 모임을 열어요.

[기부금은 이렇게 쓰여요]
(목표 금액 9,000,000원)
· 긴급 생계비: 4,500,000원
· 아이 교육비: 2,700,000원
· 상담과 모임 운영: 1,800,000원

[지금 상황]
일을 하면서 아이를 돌보는 부모님은 하루가 짧아요. 한 달 한 달 버티는 가정에 작은 숨통이 되고 싶어요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 2160000, 9000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15 DAY)),
(10, '별빛 병원학교', '오래 입원한 아이들이 병원에서도 학교 수업을 이어갈 수 있도록 도와요.

[이런 일을 해요]
· 소아암과 희귀질환으로 입원한 학생이 병실에서 수업을 들어요.
· 퇴원 후 학교에 돌아가는 아이를 위한 학습 적응 프로그램을 운영해요.
· 미술과 음악 활동으로 치료 중인 아이들의 마음을 돌봐요.

[기부금은 이렇게 쓰여요]
(목표 금액 7,000,000원)
· 태블릿과 학습 기기: 2,800,000원
· 교육 프로그램 강사료: 2,450,000원
· 미술·음악 재료: 1,750,000원

[지금 상황]
아이들은 아파도 배움을 놓고 싶어 하지 않아요. 병실에서도 교실처럼 수업을 받을 수 있게 해 주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 5250000, 7000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 45 DAY)),
(11, '느린걸음 자립준비청년', '보호가 끝나 홀로서기를 시작하는 청년들이 주거와 생활을 안정적으로 이어갈 수 있도록 도와요.

[이런 일을 해요]
· 보호종료 후 5년 안의 청년에게 주거 보증금 일부와 생활 물품을 지원해요.
· 일자리와 금융 관리를 알려주는 멘토링을 운영해요.
· 명절과 생일에 함께 모여 식사하며 안부를 나눠요.

[기부금은 이렇게 쓰여요]
(목표 금액 10,000,000원)
· 주거 보증금 지원: 5,000,000원
· 생활 물품과 가전: 2,500,000원
· 멘토링과 모임 운영: 2,500,000원

[지금 상황]
기댈 곳이 많지 않은 청년에게는 첫 방 한 칸이 가장 큰 도움이에요. 시작이 조금 덜 두렵도록 함께해 주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 2000000, 10000000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 50 DAY)),
(12, '마을 연탄은행', '연탄으로 겨울을 나는 이웃의 집에 연탄과 난방비를 전달해요.

[이런 일을 해요]
· 연탄 보일러를 쓰는 저소득 가정 70곳에 겨울 동안 연탄을 가져다 드려요.
· 자원봉사자들이 릴레이로 연탄을 날라 가파른 골목까지 전달해요.
· 연탄 대신 난방 기구가 필요한 집에는 전기장판과 보일러 점검을 지원해요.

[기부금은 이렇게 쓰여요]
(목표 금액 5,500,000원)
· 연탄 구입: 3,300,000원
· 연탄 배달 운영비: 820,000원
· 난방 기구와 보일러 점검: 1,380,000원

[지금 상황]
연탄 한 장이 하루의 따뜻함이에요. 이번 겨울을 모두가 따뜻하게 보낼 수 있도록 힘을 모아 주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 4620000, 5500000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12 DAY)),
(13, '해오름 다문화 한글교실', '한국어가 서툰 이주민과 다문화 가정 아이들이 한글을 배우고 지역에 자리 잡을 수 있도록 도와요.

[이런 일을 해요]
· 주 3회 저녁에 성인 이주민을 위한 한글 수업을 열어요.
· 초등학교에 다니는 다문화 가정 아이들의 읽기와 받아쓰기를 도와요.
· 병원과 관공서에서 쓰는 생활 한국어를 함께 연습해요.

[기부금은 이렇게 쓰여요]
(목표 금액 4,500,000원)
· 교재와 학습 자료: 1,350,000원
· 강사와 통번역 도우미 사례비: 2,250,000원
· 수업 공간 운영비: 900,000원

[지금 상황]
말이 통하지 않으면 병원에 가는 일도 어려워요. 한글을 배우는 분들이 이웃과 편하게 인사할 수 있게 도와주세요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 900000, 4500000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 18 DAY)),
(14, '두루 장애인 일자리 카페', '발달장애인 바리스타가 일하는 카페의 설비와 교육을 지원해 안정적인 일자리를 이어가요.

[이런 일을 해요]
· 발달장애인 8명이 바리스타와 제과 보조로 일하고 있어요.
· 직무 코치가 함께 일하며 주문 받기와 계산을 익히도록 도와요.
· 수익금은 근무자 급여와 훈련비로 다시 쓰여요.

[기부금은 이렇게 쓰여요]
(목표 금액 6,500,000원)
· 커피 머신과 오븐 교체: 3,580,000원
· 직무 코치 사례비: 1,950,000원
· 원두와 재료비: 970,000원

[지금 상황]
일하는 즐거움을 알게 된 분들이 많아요. 낡은 설비가 고장 나기 전에 새로 바꿔서 일자리를 지키고 싶어요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 5850000, 6500000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 70 DAY)),
(15, '구름빵 길고양이 급식소', '겨울을 나는 길고양이에게 급식소와 쉼터를 마련하고, 중성화 수술로 개체 수를 조절해요.

[이런 일을 해요]
· 동네 곳곳에 급식소를 두고 매일 사료와 깨끗한 물을 채워요.
· 겨울용 단열 쉼터를 만들어 추위를 피할 수 있게 해요.
· 포획·중성화·방사(TNR)로 새끼 고양이가 길에서 고생하는 일을 줄여요.

[기부금은 이렇게 쓰여요]
(목표 금액 3,500,000원)
· 사료와 급수 관리: 1,400,000원
· 단열 쉼터 제작: 880,000원
· 중성화 수술비: 1,220,000원

[지금 상황]
추위가 오면 길 위의 작은 생명이 가장 먼저 힘들어져요. 이웃과 고양이가 함께 사는 골목을 만들고 싶어요.

[기부 안내]
· 경매에서 모은 포인트로 100포인트(100원) 단위로 기부할 수 있어요.
· 목표 금액이 채워지면 기부가 마감되고, 모인 금액은 위에 적은 곳에 쓰여요.
· 작은 금액도 큰 힘이 돼요. 함께해 주셔서 고맙습니다.', NULL, 1, 490000, 3500000, 0, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 8 DAY));

INSERT INTO donations (donation_id, target_id, user_id, donation_amount, created_at) VALUES
(300, 6, 7, 873000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 28217 MINUTE)),
(301, 6, 15, 330000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 13936 MINUTE)),
(302, 6, 12, 381000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 13710 MINUTE)),
(303, 6, 11, 543000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10149 MINUTE)),
(304, 6, 6, 269000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4586 MINUTE)),
(305, 6, 10, 518000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4418 MINUTE)),
(306, 6, 3, 31000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4167 MINUTE)),
(307, 6, 10, 295000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3507 MINUTE)),
(308, 7, 12, 953000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 45239 MINUTE)),
(309, 7, 12, 1881000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 26335 MINUTE)),
(310, 7, 1, 1890000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24842 MINUTE)),
(311, 7, 8, 1136000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24181 MINUTE)),
(312, 7, 12, 2060000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20661 MINUTE)),
(313, 8, 15, 112000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 40194 MINUTE)),
(314, 8, 16, 641000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 34376 MINUTE)),
(315, 8, 13, 111000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 34105 MINUTE)),
(316, 8, 9, 23000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 31459 MINUTE)),
(317, 8, 13, 128000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20718 MINUTE)),
(318, 8, 12, 365000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2917 MINUTE)),
(319, 9, 5, 160000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 19009 MINUTE)),
(320, 9, 11, 1099000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6698 MINUTE)),
(321, 9, 10, 623000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5615 MINUTE)),
(322, 9, 11, 234000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3504 MINUTE)),
(323, 9, 14, 44000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2087 MINUTE)),
(324, 10, 3, 147000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 47446 MINUTE)),
(325, 10, 2, 47000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 45575 MINUTE)),
(326, 10, 9, 186000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 18127 MINUTE)),
(327, 10, 13, 1739000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 11499 MINUTE)),
(328, 10, 8, 1977000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4890 MINUTE)),
(329, 10, 10, 1154000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 921 MINUTE)),
(330, 11, 6, 107000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 47665 MINUTE)),
(331, 11, 1, 171000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 28581 MINUTE)),
(332, 11, 16, 452000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 15851 MINUTE)),
(333, 11, 13, 400000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4195 MINUTE)),
(334, 11, 10, 870000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1123 MINUTE)),
(335, 12, 11, 308000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 14659 MINUTE)),
(336, 12, 16, 546000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12970 MINUTE)),
(337, 12, 14, 1783000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 12078 MINUTE)),
(338, 12, 10, 32000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10897 MINUTE)),
(339, 12, 12, 678000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7982 MINUTE)),
(340, 12, 9, 447000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5305 MINUTE)),
(341, 12, 15, 333000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 3319 MINUTE)),
(342, 12, 2, 453000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2081 MINUTE)),
(343, 12, 14, 40000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1868 MINUTE)),
(344, 13, 1, 183000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 22997 MINUTE)),
(345, 13, 2, 125000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 20685 MINUTE)),
(346, 13, 17, 115000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 18328 MINUTE)),
(347, 13, 14, 267000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 11386 MINUTE)),
(348, 13, 7, 112000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10261 MINUTE)),
(349, 13, 8, 10000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 7824 MINUTE)),
(350, 13, 17, 37000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5544 MINUTE)),
(351, 13, 9, 51000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 1158 MINUTE)),
(352, 14, 13, 209000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 94706 MINUTE)),
(353, 14, 4, 3200000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 90080 MINUTE)),
(354, 14, 3, 645000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 86724 MINUTE)),
(355, 14, 11, 949000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 54111 MINUTE)),
(356, 14, 16, 773000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 30437 MINUTE)),
(357, 14, 4, 74000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 24431 MINUTE)),
(358, 15, 8, 16000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 10367 MINUTE)),
(359, 15, 11, 35000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 8110 MINUTE)),
(360, 15, 13, 43000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 6698 MINUTE)),
(361, 15, 9, 211000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 5025 MINUTE)),
(362, 15, 17, 39000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 4501 MINUTE)),
(363, 15, 5, 7000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2922 MINUTE)),
(364, 15, 17, 139000, DATE_SUB(UTC_TIMESTAMP(), INTERVAL 2173 MINUTE));

COMMIT;
