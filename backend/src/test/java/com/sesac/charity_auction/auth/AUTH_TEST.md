# JWT 로그인 테스트 가이드

## 1. JWT 서명 키

### 1-1. 발급
```bash
openssl rand -base64 32
```

### 1-2. 입력
- `.env` 파일을 열어 `JWT_SECRET` 항목에 입력.

## 2. 테스트 진행

### 2-1. 자동 테스트
```bash
./gradlew test --tests "com.sesac.charity_auction.auth.*"
```
- 기대 결과 `BUILD SUCCESSFUL` 항목이 출력되면 통과.

### 2-2. 수동 테스트

### 2-3. CLI 테스트
- `docs/jwt-auth/auth-api-test.http` 문서를 통해 단일 테스트 수행.

### 2-4. Browser 테스트
```text
http://localhost:8080/swagger-ui.html
```
- 현재 Token 입력란이 존재하지 않아서 회원 서비스는 `2-3. CLI 테스트` 진행 권장.

## 3. 오류 사전 검증
- `.env` 파일을 생성했는지, **DB 정보**와 **JWT 정보**가 정확히 입력되어 있는지 확인.
- `JWT_SECRET` 항목의 값을 Base64로 생성한 32byte 형식인지 확인.