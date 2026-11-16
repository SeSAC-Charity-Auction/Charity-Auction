-- 목표 기부금을 채웠는지 나타내는 열이에요. 누적액이 목표 이상이 되면 기부 처리에서 TRUE로 바꿔요.
-- V1은 이미 합쳐진 파일이라 고치지 않고, 바꿀 내용은 이 파일로 추가해요.

ALTER TABLE donation_targets
    ADD COLUMN is_achieved BOOLEAN NOT NULL DEFAULT FALSE COMMENT '목표 기부금 달성 여부' AFTER target_amount;

-- 이미 목표를 채운 기부처도 맞춰 줘요.
UPDATE donation_targets SET is_achieved = TRUE WHERE total_donation >= target_amount;
