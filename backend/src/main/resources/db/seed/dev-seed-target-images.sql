-- 개발용 기부처 이미지 연결. 이미지 파일은 db/seed/images/target/ 에 있고, DevSeedRunner가 업로드 폴더로 복사해요.
-- 이미지가 비어 있는 시드 기부처(번호와 이름이 모두 같은 것)에만 넣어요. 직접 올린 이미지는 바꾸지 않아요.

UPDATE donation_targets SET target_image = '/uploads/target/fd831dc1-4a59-46ea-bf15-8d1dad0af895.jpg' WHERE target_id = 3 AND target_name = '한결 어르신 돌봄' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/5740ba86-0adc-4843-9a8d-9ab6e5db6336.jpg' WHERE target_id = 4 AND target_name = '새움 청소년 쉼터' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/cfc19a58-d434-44cb-b28e-f24ab9bfed89.jpg' WHERE target_id = 6 AND target_name = '햇살 지역아동센터' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/6ba48e1b-b560-4f31-a561-468afdf0aebd.jpg' WHERE target_id = 7 AND target_name = '바람길 이동권 지원' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/2d3e6944-752e-4d0a-8de5-aecdb154a137.jpg' WHERE target_id = 8 AND target_name = '초록손 숲 가꾸기' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/8403dd9a-6b33-4f93-a52d-8a3c383fb69f.jpg' WHERE target_id = 9 AND target_name = '온기 한부모 가정 지원' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/9d864190-8402-4b44-a664-464f73f01a3a.jpg' WHERE target_id = 10 AND target_name = '별빛 병원학교' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/e93e9c46-4585-4b45-b2ac-3ebf218c2ddf.png' WHERE target_id = 11 AND target_name = '느린걸음 자립준비청년' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/641b1cfd-4317-4708-bc80-06bb634a9498.jpg' WHERE target_id = 12 AND target_name = '마을 연탄은행' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/d7cc382d-3591-49b6-b70a-cfad92ecb84b.jpg' WHERE target_id = 13 AND target_name = '해오름 다문화 한글교실' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/f3fa2617-87ac-45d8-8a97-b554778684e0.jpg' WHERE target_id = 14 AND target_name = '두루 장애인 일자리 카페' AND target_image IS NULL;
UPDATE donation_targets SET target_image = '/uploads/target/6410b3ad-7931-4636-a481-baac61fe1f8a.jpg' WHERE target_id = 15 AND target_name = '구름빵 길고양이 급식소' AND target_image IS NULL;
