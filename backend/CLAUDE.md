# 기부 경매 사이트 (2조 조별 프로젝트)

학습용 모의 서비스예요. 실제 결제와 모금은 없고, 모의 포인트와 더미 데이터만 써요. 팀원은 4명이고 각자 풀스택으로 작업해요. 팀원 중에는 입문자가 있어서, 코드를 바꿀 때는 이유를 짧게 설명해 주세요.

## 저장소 구조 (모노레포)

```text
backend/    Spring Boot + JPA + MySQL (포트 8080)
frontend/   Next.js(App Router, TypeScript) (포트 3000)
docs/       요구사항, API 명세, ERD
docker-compose.yml   로컬 MySQL (mysql:8.4, utf8mb4, UTC)
```

## 지금 상태

- **프론트엔드**: `/donations`(기부 현황)와 `/donations/[targetId]`(기부처 상세 + 슬라이더 기부 폼)가 끝났고, 실제 백엔드 API를 불러요. (`frontend/app/donations/data.ts`)
- **백엔드**: 기부 조회·기부하기·내 포인트 API와 회원가입(`/api/v1/users/...`)이 있어요. 로그인(JWT)은 아직 없어서, 개발 중에는 `X-Dev-User-Id` 헤더로 임시 처리해요. (아래 "작업 순서" 참고)

## 명령어

```bash
docker compose up -d          # 로컬 MySQL 실행 (루트에서)
cd backend && ./gradlew bootRun   # Maven이면 ./mvnw spring-boot:run
cd backend && ./gradlew test
cd frontend && npm run dev
cd frontend && npm run build
```

## 백엔드 규칙

- **패키지**: `CharityAuctionApplication`이 있는 패키지 아래에 만들어요. `global`(config, error), `member`, `point`, `donation`, `auction`으로 나누고, 각 도메인 안은 `controller / service / repository / domain / dto`로 나눠요.
- 엔티티를 API 응답으로 직접 돌려주지 않고 DTO를 써요.
- **금액은 정수**(`long`)로만 다뤄요. `float`와 `double`은 쓰지 않아요.
- 시간은 UTC로 저장하고, 응답은 ISO 8601 문자열로 줘요.
- **성공 응답은 DTO 그대로**(감싸지 않음), **실패 응답은 HTTP 상태 코드 + 아래 모양의 JSON**이에요. 예외 클래스는 `global/common/exception`의 `BusinessException`, `ErrorResponse`, `GlobalExceptionHandler` 하나만 써요. (같은 이름의 클래스를 다른 패키지에 또 만들지 않아요.)
  - `{ "timestamp", "status", "error", "code"(있을 때만), "message", "path" }`
  - `code`는 프론트가 실패 이유를 구분해야 할 때만 넣어요. 기부 쪽은 `throw new BusinessException(ErrorCode.INSUFFICIENT_POINT)`, 그 외에는 `throw new BusinessException(HttpStatus.CONFLICT, "메시지")`예요.
- 에러 코드는 프론트의 `DonateErrorCode`와 이름이 같아야 해요: `NOT_LOGGED_IN`, `TARGET_NOT_FOUND`, `TARGET_CLOSED`, `INVALID_AMOUNT`, `INSUFFICIENT_POINT`, `UNKNOWN`.
- 화면의 검증은 믿지 않아요. 금액, 권한, 상태는 서버에서 다시 검사해요.
- 개인정보는 서버에서 마스킹해서 내려줘요. (예: 기부자 이름 `김**`)
- **스키마 변경은 Flyway 마이그레이션으로만** 해요. 위치는 `backend/src/main/resources/db/migration/V번호__설명.sql`이고, 이미 합쳐진 `V` 파일은 수정하지 않고 새 번호로 추가해요. `ddl-auto`는 `validate`예요.
- 비밀 정보(DB 비밀번호, JWT 키)는 코드에 쓰지 않아요. `.env`와 `application-local.yml`은 커밋하지 않고, 견본 파일(`.env.example`, `application-local.yml.example`)만 올려요.
- Spring Boot 4.x라면: 스타터 이름이 `spring-boot-starter-webmvc`이고, Flyway는 `spring-boot-starter-flyway`를 따로 넣어야 해요. JSON은 Jackson 3예요. 먼저 `build.gradle`의 실제 버전을 확인하고 거기에 맞게 써 주세요.
- `spring-boot-starter-security`가 있으면 설정 전에는 모든 API가 401이에요. 인증을 만들기 전에는 임시로 `permitAll` 설정을 둬요.

## DB (ERD 기준, 일부는 가정)

- 테이블: `users`, `donation_targets`, `donations`, `point_histories`. 처음 테이블 정의는 `V1__create_core_tables.sql` (이미 있으면 그대로 쓰고, 없으면 ERD에 맞춰 만들어요).
- **`users`** (ERD에 없어서 팀이 정한 구조): 엔티티는 `user.entity.User` 하나예요. `email`(로그인 아이디 역할), `password`(BCrypt), `name`, `nickname`, `role`, `point_balance`, `is_deleted`, `image`(비울 수 있음), `created_at`, `updated_at`이에요. 예전에 있던 `login_id`는 없어요.
- **가정 2**: 잔액은 `users.point_balance`에 두고 조건부 `UPDATE`로 차감해요. `point_histories`는 기록(장부)이에요.
- **가정 3**: `point_type`은 DB에 `EARN`/`USE`로 저장하고, API 응답에서는 `"적립"`/`"사용"`으로 바꿔요.
- `point_histories.auction_id`의 외래키는 경매 테이블이 생기면 새 마이그레이션(V3 이후)으로 추가해요. (`V2`는 `users`를 회원가입 엔티티에 맞추는 데 썼어요.)
- **더미 데이터**: `backend/src/main/resources/db/seed/dev-seed.sql`을 내 로컬의 비어 있는 DB에 직접 넣어요. (Flyway가 자동 실행하지 않고, 데이터를 지우지도 않아요.)

## API 계약 (프론트 `data.ts`의 타입이 기준이에요)

| 요청                                   | 인증   | 응답                                                                                      |
| -------------------------------------- | ------ | ----------------------------------------------------------------------------------------- |
| `GET /api/donations/summary`           | 불필요 | `{ totalDonation, donationCount, donorCount, targets[], recentDonations[] }`              |
| `GET /api/donation-targets/{targetId}` | 불필요 | `{ target, donorCount, donationCount, recentDonations[] }`, 없으면 404 `TARGET_NOT_FOUND` |
| `GET /api/me/points`                   | 필요   | `{ balance, recent[] }`, 로그인하지 않았으면 401                                          |
| `GET /api/me`                          | 필요   | 마이페이지 내 정보 `{ userId, email, name, nickname, userImage(null 가능), point, createdAt, donationCount, totalDonation, canEditTargets }`, 로그인하지 않았으면 401 |
| `POST /api/donation-targets/{targetId}/image` | 필요 (ADMIN 또는 local 프로필) | multipart `file`(PNG/JPG/GIF/WEBP, 2MB 이하) → `{ targetImage }`. 권한 없으면 403 `FORBIDDEN`, 없는 기부처면 404 |
| `POST /api/donations`                  | 필요   | 요청 `{ targetId, amount }` → 성공 `{ amount, balance }`, 실패 `{ code, message }`        |

필드 모양:

- **target**: `targetId, targetName, description(null 가능), targetImage(null 가능), isActive, totalDonation, targetAmount, createdAt`
- **donation record**: `donationId, targetId, targetName, donorName(마스킹), donationAmount, createdAt`
- **point entry**: `pointId, pointType("적립"|"사용"), pointAmount, description, createdAt`. `description`은 `donation_id`/`auction_id`를 보고 서버가 만든 문구예요. (예: "푸른숲 어린이 도서관 기부")
- `summary.recentDonations`는 최신 5건, 상세의 `recentDonations`는 최신 8건, `me/points.recent`는 최신 8건(모두 최신순)이에요.
- `donorCount`는 `COUNT(DISTINCT user_id)`예요.
- 기부 금액 규칙은 최소 1,000P, 단위 100P예요. (프론트 `frontend/app/donations/rules.ts`, 백엔드 `DonationPolicy`와 같아야 해요.)

## 기부하기(`POST /api/donations`) 처리 규칙 (가장 중요해요)

하나의 `@Transactional` 메서드에서 아래를 순서대로 처리해요.

1. 금액이 최소·단위에 맞는지 검사 → 아니면 `INVALID_AMOUNT`
2. `UPDATE users SET point_balance = point_balance - :amount WHERE user_id = :id AND point_balance >= :amount` → 영향 행이 0이면 `INSUFFICIENT_POINT`
3. `UPDATE donation_targets SET total_donation = total_donation + :amount WHERE target_id = :id AND is_active = TRUE` → 영향 행이 0이면 `TARGET_CLOSED` (없는 기부처는 `TARGET_NOT_FOUND`)
4. `donations`에 기록
5. `point_histories`에 `USE` 기록

같은 사용자가 동시에 여러 번 요청해도 잔액이 마이너스가 되지 않아야 해요. 이걸 증명하는 동시성 테스트를 꼭 만들어요.

## 인증 (5단계에서 정해요)

로그인 응답으로 JWT를 JSON으로 주고, Next.js 서버가 그것을 httpOnly 쿠키 `accessToken`에 저장한 뒤, 이후 서버에서 Spring을 부를 때 `Authorization: Bearer ...`로 붙여요. 비밀번호는 BCrypt로 저장해요. (이 방식이 바뀌면 `frontend/app/donations/data.ts`의 주석과 코드도 같이 바꿔요.)

## 프론트엔드를 건드릴 때 주의

- Next.js 16.x이고 `cacheComponents: true`예요. 현재 시각이나 요청마다 달라지는 값은 `<Suspense>` 안에서 `await connection()` 뒤에 써요. 클라이언트 컴포넌트가 렌더링되는 중에는 `Date.now()`, `Math.random()`, `crypto`를 쓰지 않아요.
- `frontend/next.config.ts`의 Turbopack CSS 규칙은 `*.module.css`를 제외해야 CSS Modules가 동작해요. (`condition: { not: { path: "*.module.css" } }`) 이 설정을 지우거나 바꾸지 마세요.
  <<<<<<< HEAD

- # `data.ts`의 모든 함수가 이제 실제 API를 불러요. (mock 저장소는 지웠어요.) `API_BASE_URL`은 `frontend/.env.local`에 적어요. (예: `http://localhost:8080`) 개발 중 로그인은 `frontend/.env.local`의 `DEV_USER_ID`(예: 1)로 임시 처리해요. (백엔드 `local` 프로필의 `X-Dev-User-Id` 헤더, JWT 로그인이 생기면 지워요.)

- 가짜 데이터를 실제 API로 바꿀 때는 `data.ts`의 각 함수 **안쪽만** `fetch`로 바꿔요. 방법은 주석에 있어요. `API_BASE_URL`은 `frontend/.env.local`에 적어요. (예: `http://localhost:8080`) `MOCK_LOGGED_IN` 플래그는 개발용이에요.
    > > > > > > > a0bc95c3a05228ccdeddf985f5a03a122d9a9da8
- 화면의 데이터 요청은 브라우저가 아니라 Next.js 서버가 Spring에 보내서, 지금은 CORS 설정이 필요 없어요.

## 작업 순서 (한 번에 한 단계씩)

| 단계 | 할 일                                                      | 끝났다는 증거                                   |
| ---- | ---------------------------------------------------------- | ----------------------------------------------- |
| 1    | DB 연결 + 앱 실행                                          | `Started CharityAuctionApplication` 로그        |
| 2    | 패키지 구조, 공통 에러 형식, `/api/health`, 임시 보안 설정 | `/api/health`가 `{"status":"UP"}`               |
| 3    | Flyway 테이블 + 엔티티                                     | 앱 시작 시 테이블 생성, 검증 오류 없음          |
| 4    | 조회 API 2개 (기부 현황, 기부처 상세)                      | 프론트 mock을 실제 API로 바꿔도 화면이 같음     |
| 5    | 회원가입·로그인(JWT) + 내 포인트 API                       | 로그인한 사람만 `/api/me/points` 가능           |
| 6    | 기부하기 API (트랜잭션)                                    | 슬라이더로 기부하면 잔액과 누적액이 실제로 바뀜 |
| 7    | 동시성 테스트                                              | 동시에 여러 번 기부해도 잔액이 마이너스가 안 됨 |

## 작업 방식 부탁

- 시작하기 전에 `build.gradle`(또는 `pom.xml`)과 기존 파일을 읽고, 실제 Spring Boot·Java 버전에 맞는 의존성과 import를 써 주세요. 추측하지 말고 빌드나 실행으로 확인해 주세요.
- 한 단계가 끝나면 실행하거나 테스트한 결과로 확인하고 요약해 주세요. 다음 단계는 제가 확인한 뒤에 진행해 주세요.
- `main` 브랜치에 직접 커밋하지 않아요. `feature/...` 브랜치와 PR로 합쳐요. Git 작업은 제가 요청할 때만 해 주세요.
