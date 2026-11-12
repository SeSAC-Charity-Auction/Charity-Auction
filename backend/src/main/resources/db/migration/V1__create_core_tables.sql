-- 핵심 테이블 4개. 시간(DATETIME)은 모두 UTC로 저장해요.
-- users는 ERD에 없어서 최소 구조로 가정했어요. (CLAUDE.md 가정 1)
-- point_histories.auction_id의 외래키는 경매 테이블이 생기면 V2에서 추가해요.

CREATE TABLE users (
    user_id       BIGINT       NOT NULL AUTO_INCREMENT,
    -- login_id      VARCHAR(50)  NOT NULL,
    password      VARCHAR(100) NOT NULL COMMENT 'BCrypt 해시',
    name          VARCHAR(50)  NOT NULL,
    nickname      VARCHAR(50)  NOT NULL,
    email         VARCHAR(100) NOT NULL,
    image         VARCHAR(500) NOT NULL,
    is_deleted    BOOLEAN NOT NULL DEFAULT FALSE,
    role          VARCHAR(20)  NOT NULL DEFAULT 'USER',
    point_balance BIGINT       NOT NULL DEFAULT 0 COMMENT '보유 포인트(잔액)',
    created_at    DATETIME     NOT NULL,
    updated_at    DATETIME     NOT NULL,
    PRIMARY KEY (user_id),
    -- UNIQUE KEY uk_users_login_id (login_id),
    UNIQUE KEY uk_users_email (email),
    -- 코드에서 막지 못해도 DB가 마이너스 잔액을 한 번 더 막아 줘요.
    CONSTRAINT ck_users_point_balance CHECK (point_balance >= 0)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE donation_targets (
    target_id       BIGINT       NOT NULL AUTO_INCREMENT COMMENT '기부 대상 고유 번호',
    target_name     VARCHAR(100) NOT NULL,
    description     TEXT         NULL,
    target_image    VARCHAR(500) NULL,
    is_active       BOOLEAN      NOT NULL DEFAULT TRUE COMMENT '기부 가능 여부',
    total_donation  BIGINT       NOT NULL DEFAULT 0 COMMENT '누적 기부금',
    target_amount   BIGINT       NOT NULL COMMENT '목표 기부금',
    created_at      DATETIME     NOT NULL,
    PRIMARY KEY (target_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE donations (
    donation_id     BIGINT   NOT NULL AUTO_INCREMENT,
    target_id       BIGINT   NOT NULL COMMENT '기부 대상 고유 번호',
    user_id         BIGINT   NOT NULL COMMENT '회원 고유 번호',
    donation_amount BIGINT   NOT NULL,
    created_at      DATETIME NOT NULL,
    PRIMARY KEY (donation_id),
    KEY idx_donations_target_id (target_id),
    KEY idx_donations_user_id (user_id),
    KEY idx_donations_created_at (created_at),
    CONSTRAINT fk_donations_target FOREIGN KEY (target_id) REFERENCES donation_targets (target_id),
    CONSTRAINT fk_donations_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE point_histories (
    point_id     BIGINT      NOT NULL AUTO_INCREMENT,
    auction_id   BIGINT      NULL COMMENT '경매 고유 번호 (FK는 V2에서 추가)',
    user_id      BIGINT      NOT NULL COMMENT '회원 고유 번호',
    donation_id  BIGINT      NULL,
    point_amount BIGINT      NOT NULL,
    point_type   VARCHAR(20) NOT NULL COMMENT 'EARN(적립) / USE(사용)',
    created_at   DATETIME    NOT NULL,
    PRIMARY KEY (point_id),
    KEY idx_point_histories_user_created (user_id, created_at),
    KEY idx_point_histories_donation_id (donation_id),
    CONSTRAINT fk_point_histories_user FOREIGN KEY (user_id) REFERENCES users (user_id),
    CONSTRAINT fk_point_histories_donation FOREIGN KEY (donation_id) REFERENCES donations (donation_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
