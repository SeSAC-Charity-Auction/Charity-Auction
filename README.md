# 가치잇다 (Charity Auction)

물품을 경매로 팔고, 낙찰 금액을 기부로 잇는 **기부 경매 사이트**예요. SeSAC 조별 프로젝트이고, 실제 결제와 모금은 없는 **학습용 모의 서비스**예요. 모의 포인트와 더미 데이터만 써요.

## 주요 기능

- **경매**: 물품 등록·수정, 목록(상태 필터·정렬·검색), 상세, 실시간 입찰(WebSocket), 시간 맞춰 시작·마감하는 스케줄러
- **낙찰 기회**: 경매가 끝나면 최고가 입찰자부터 낙찰 기회를 줘요. 포기하거나 시간이 지나면 차순위 입찰자에게 넘어가요.
- **기부**: 기부처 목록·상세, 포인트로 기부, 기부 순위
- **마이페이지**: 프로필·닉네임·사진, 포인트 내역, 내 경매, 낙찰 내역, 낙찰 기회, 기부 이력
- **회원**: 회원가입, 로그인(JWT), 다크 모드

## 기술 스택

| 구분 | 사용 기술 |
| --- | --- |
| 프론트엔드 | Next.js 16 (App Router, Cache Components), React 19, TypeScript, CSS Modules, STOMP(`@stomp/stompjs`) |
| 백엔드 | Java 21, Spring Boot 4, Spring Security(JWT), JPA, QueryDSL, Flyway, WebSocket, springdoc(Swagger) |
| DB | MySQL |

## 저장소 구조

```text
backend/    Spring Boot API 서버 (포트 8080)
frontend/   Next.js 웹 (포트 3000)
docs/       API 테스트 파일 등 문서
```

## 시작하기

### 준비물

- JDK 21
- Node.js 20 이상, npm
- MySQL 8 (로컬에서 실행 중이어야 해요)

### 1. DB 만들기

```sql
CREATE DATABASE auctions CHARACTER SET utf8mb4;
```

테이블은 앱을 처음 실행할 때 Flyway가 만들어 줘요.

### 2. 백엔드 실행

`backend/.env.example`을 복사해서 `backend/.env`를 만들고 값을 채워요. (`.env`는 커밋하지 않아요.)

```properties
DB_URL=jdbc:mysql://localhost:3306/auctions?connectionTimeZone=GMT%2B9&forceConnectionTimeZoneToSession=true
DB_USERNAME=root
DB_PASSWORD=내_비밀번호
JWT_SECRET=충분히_긴_아무_문자열
```

`DB_URL`을 비워 두면 위 기본값(`localhost:3306/auctions`)을 써요. 서버와 DB 시간은 모두 한국 시간(KST)이에요.

```bash
cd backend
./gradlew bootRun
```

### 3. 프론트엔드 실행

`frontend/.env.local`을 만들어요.

```properties
API_BASE_URL=http://localhost:8080
NEXT_PUBLIC_WS_URL=ws://localhost:8080/ws
```

```bash
cd frontend
npm install
npm run dev
```

http://localhost:3000 에서 열려요.

### 4. 로그인하기

더미 회원은 비밀번호가 자리표시 값이라 로그인할 수 없어요. 화면에서 **회원가입**을 한 뒤 로그인하세요.

## 개발용 더미 데이터

백엔드를 기본 프로필(`local`)로 실행하면 `DevSeedRunner`가 시작할 때마다 더미 데이터를 넣어요.

- 회원, 카테고리, 기부처 15곳, 경매 약 100건(진행 중·예정·마감), 입찰 내역, 기부 내역, 이미지와 상세 설명
- 이미 있는 데이터와 직접 만든 데이터는 건드리지 않아요. 비어 있는 곳만 채워요.
- 시드 이미지는 `backend/src/main/resources/db/seed/images/`에 있고, 시작할 때 `uploads/`로 복사돼요.
- 끄려면 `APP_DEV_SEED_ENABLED=false`로 실행하세요.
- 처음부터 다시 넣으려면 내 **로컬** DB를 비우고(`DROP DATABASE auctions; CREATE DATABASE auctions;`) 다시 실행하세요. 팀 공용 DB에서는 하지 마세요.

## 환경 변수

| 이름 | 위치 | 설명 |
| --- | --- | --- |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | backend | DB 접속 정보 |
| `JWT_SECRET` | backend | JWT 서명 키 (필수) |
| `UPLOAD_DIR` | backend | 업로드 파일 저장 폴더 (기본 `uploads`) |
| `SCHEDULER_AUCTION_ENABLED` | backend | 경매 시작·마감 스케줄러 (기본 `true`) |
| `APP_DEV_SEED_ENABLED` | backend | 더미 데이터 자동 입력 (기본 `true`, `local` 프로필에서만) |
| `SPRING_PROFILES_ACTIVE` | backend | 기본은 `local`. 배포할 때는 반드시 다른 값으로 지정하세요. |
| `API_BASE_URL` | frontend | 백엔드 주소 |
| `NEXT_PUBLIC_WS_URL` | frontend | 실시간 입찰용 WebSocket 주소 |

## 자주 쓰는 명령어

```bash
# 백엔드
cd backend
./gradlew bootRun     # 실행
./gradlew test        # 테스트

# 프론트엔드
cd frontend
npm run dev           # 개발 서버
npm run build         # 빌드
npm run lint          # 린트
```

실행 중에는 Swagger UI에서 API를 확인할 수 있어요: http://localhost:8080/swagger-ui.html

## 폴더 안내

**backend** `src/main/java/com/sesac/charity_auction/`

```text
auction/            경매 (등록·수정·조회·검색)
auctioncandidate/   낙찰 기회 (후보 순서대로 제안)
bid/                입찰
donation/           기부처와 기부
point/              포인트 내역
user/ auth/         회원, 로그인(JWT)
category/           카테고리
scheduler/          경매 시작·마감 스케줄러
global/             공통 설정, 예외, 시드
```

도메인 안은 `controller / service / repository / domain / dto`로 나눠요. DB 스키마는 `src/main/resources/db/migration`의 Flyway 파일로 관리해요.

**frontend** `app/`

```text
auctions/    경매 목록·상세·등록·수정
donations/   기부처 목록·상세
mypage/      마이페이지
rank/        기부 순위
login/ signup/   로그인, 회원가입
api/         로그인 같은 라우트 핸들러
```

## 협업 규칙

- 브랜치: `develop`에서 `feature/…` 브랜치를 만들어 작업하고, Pull Request로 합쳐요.
- 이슈 템플릿(기능 개발·버그 수정·리팩토링)은 `.github/ISSUE_TEMPLATE/`에 있어요.
- 금액은 정수로만 다루고, 화면의 검증은 믿지 않고 서버에서 다시 검사해요.
- `.DS_Store`, `.env`, `uploads/`는 커밋하지 않아요.

## 알아 둘 점

- 낙찰 기회의 응답 제한 시간은 지금 **1분**이에요. (테스트하기 쉽게 짧게 둔 값이에요.)
- 경매는 **시작 전이고 입찰이 없을 때만** 수정할 수 있어요.
- 백엔드 테스트 일부(`AuctionTestFixture`)에 컴파일 오류가 있어서, 전체 `./gradlew test`는 아직 통과하지 않아요.
