CREATE TABLE refresh_tokens (
    refresh_token_id BIGINT      NOT NULL AUTO_INCREMENT COMMENT 'Refresh Token 고유 번호',
    user_id          BIGINT      NOT NULL COMMENT '회원 고유 번호',
    token_hash       VARCHAR(64) NOT NULL COMMENT '토큰 원문의 SHA-256 해시 (16진수)',
    expires_at       DATETIME    NOT NULL COMMENT '만료 일시 (UTC)',
    PRIMARY KEY (refresh_token_id),
    UNIQUE KEY uk_refresh_tokens_user_id (user_id),
    UNIQUE KEY uk_refresh_tokens_token_hash (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users (user_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;
