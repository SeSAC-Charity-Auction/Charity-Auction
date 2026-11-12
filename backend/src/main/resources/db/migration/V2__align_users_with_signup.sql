-- 회원가입 엔티티(user.entity.User, SignupRequest)와 users 테이블 정의를 맞춰요.
--  - image: 가입할 때 프로필 이미지가 없어서 비워 둘 수 있어야 해요. (엔티티는 nullable, 길이 300)
--  - email: 가입 요청은 최대 254자까지 허용하는데 컬럼은 100자라서, 긴 이메일이 오면 저장에 실패해요.
-- V1은 이미 합쳐진 파일이라 고치지 않고, 바꿀 내용은 이 파일로 추가해요.

ALTER TABLE users
    MODIFY COLUMN image VARCHAR(300) NULL,
    MODIFY COLUMN email VARCHAR(254) NOT NULL;
