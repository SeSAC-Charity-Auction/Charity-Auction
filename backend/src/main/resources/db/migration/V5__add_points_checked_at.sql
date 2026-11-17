-- 사용자가 "내 포인트"를 마지막으로 확인한 시각이에요. (UTC)
-- 이 시각 이후에 적립(EARN)된 포인트가 있으면 상단 메뉴의 프로필 사진에 붉은 점을 보여줘요.
-- V1은 이미 합쳐진 파일이라 고치지 않고, 바꿀 내용은 이 파일로 추가해요.

ALTER TABLE users
    ADD COLUMN points_checked_at DATETIME NULL COMMENT '내 포인트를 마지막으로 확인한 시각(UTC)';

-- 이미 쌓여 있는 적립 내역은 "이미 확인한 것"으로 보고, 붉은 점이 한꺼번에 뜨지 않게 해요.
UPDATE users SET points_checked_at = UTC_TIMESTAMP();
