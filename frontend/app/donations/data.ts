// app/donations/data.ts
// ERD(donation_targets / donations / point_histories)를 옮긴 타입과, 개발용 가짜(mock) 저장소예요.
// 백엔드 API가 준비되면 아래 함수들의 "안쪽"만 fetch로 바꾸면 되고, 화면은 그대로 둬도 돼요.

import { DONATION_STEP, MIN_DONATION } from "./rules";

/* ---------- 타입 ---------- */

// donation_targets 테이블 한 행 (기부 대상)
export type DonationTarget = {
  targetId: number; // target_id
  targetName: string; // target_name
  description: string | null; // description (NULL 가능)
  targetImage: string | null; // target_image (NULL 가능, 이미지 주소)
  isActive: boolean; // is_active (기부 가능 여부)
  totalDonation: number; // total_donation (누적 기부금)
  targetAmount: number; // target_amount (목표 기부금)
  createdAt: string; // created_at (ISO 8601)
};

// donations 테이블 한 행 + 화면에 필요한 이름 두 개
export type DonationRecord = {
  donationId: number; // donation_id
  targetId: number; // target_id
  targetName: string; // donation_targets.target_name (JOIN)
  donorName: string; // 회원 이름을 서버에서 마스킹한 값 (예: 김**)
  donationAmount: number; // donation_amount
  createdAt: string; // created_at (ISO 8601)
};

export type DonationSummary = {
  totalDonation: number; // 전체 기부금 합계
  donationCount: number; // 기부 횟수 (donations 행 수)
  donorCount: number; // 기부한 사람 수 (user_id 중복 제거)
  targets: DonationTarget[]; // 기부처 목록 (비활성 포함, 거르는 건 화면에서)
  recentDonations: DonationRecord[]; // 최신순
};

// point_histories 테이블 한 행 + 화면에 필요한 설명 문구
export type PointEntry = {
  pointId: number; // point_id
  pointType: "적립" | "사용"; // point_type
  pointAmount: number; // point_amount (크기만 쓰고, 더할지 뺄지는 pointType으로 정해요)
  description: string; // auction_id / donation_id를 보고 서버가 만든 문구
  createdAt: string; // created_at (ISO 8601)
};

export type MyPoints = {
  balance: number; // 지금 쓸 수 있는 포인트
  recent: PointEntry[]; // 최신순으로 6~8건 정도
};

// 기부처 상세 페이지에 필요한 값
export type DonationTargetDetail = {
  target: DonationTarget;
  donorCount: number; // 이 기부처에 기부한 사람 수 (user_id 중복 제거)
  donationCount: number; // 이 기부처에 기부한 횟수
  recentDonations: DonationRecord[]; // 이 기부처의 최근 기부 (최신순)
};

// 기부 요청이 실패했을 때 백엔드가 돌려줄 에러 코드 (프론트와 백엔드가 같은 이름으로 맞춰 두세요)
export type DonateErrorCode =
  | "NOT_LOGGED_IN"
  | "TARGET_NOT_FOUND"
  | "TARGET_CLOSED"
  | "INVALID_AMOUNT"
  | "INSUFFICIENT_POINT"
  | "UNKNOWN";

export type DonateResult =
  | { ok: true; amount: number; balance: number } // balance: 기부 후 남은 포인트
  | { ok: false; code: DonateErrorCode };

/* ---------- 개발용 가짜 저장소 ---------- */

// 개발 중에 로그인하지 않은 화면을 보고 싶으면 false로 바꿔 보세요.
const MOCK_LOGGED_IN = true;

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

type MockStore = {
  balance: number;
  targets: DonationTarget[];
  donations: DonationRecord[]; // 최신순
  counts: Record<number, { donors: number; count: number }>;
  points: PointEntry[]; // 최신순
  myTargets: Set<number>; // 내가 기부한 적 있는 기부처
  nextDonationId: number;
  nextPointId: number;
};

// 서버 파일이 여러 덩어리로 나뉘어 불러와져도 같은 저장소를 쓰도록 globalThis에 둬요.
// (서버를 다시 켜면 처음 상태로 돌아가요. 실제 서비스에서는 이 부분이 DB예요.)
const globalForMock = globalThis as unknown as { __donationMock?: MockStore };

function getStore(): MockStore {
  if (!globalForMock.__donationMock) globalForMock.__donationMock = createStore();
  return globalForMock.__donationMock;
}

function createStore(): MockStore {
  const targets: DonationTarget[] = [
    {
      targetId: 1,
      targetName: "푸른숲 어린이 도서관",
      description:
        "낡은 책장과 오래된 도서를 새로 채워서, 방과 후 아이들이 편하게 머물 수 있는 도서관을 만들어요.",
      targetImage: null,
      isActive: true,
      totalDonation: 6_800_000,
      targetAmount: 10_000_000,
      createdAt: ago(40 * DAY),
    },
    {
      targetId: 2,
      targetName: "다온 유기동물 보호소",
      description: "추운 겨울을 나는 보호소의 난방비와 사료를 지원해요.",
      targetImage: null,
      isActive: true,
      totalDonation: 3_150_000,
      targetAmount: 5_000_000,
      createdAt: ago(32 * DAY),
    },
    {
      targetId: 3,
      targetName: "한결 어르신 돌봄",
      description: "혼자 지내시는 어르신께 따뜻한 도시락을 전해요.",
      targetImage: null,
      isActive: true,
      totalDonation: 1_900_000,
      targetAmount: 4_000_000,
      createdAt: ago(25 * DAY),
    },
    {
      targetId: 4,
      targetName: "새움 청소년 쉼터",
      description: "청소년이 안전하게 머물고 공부할 수 있는 공간을 만들어요.",
      targetImage: null,
      isActive: true,
      totalDonation: 520_000,
      targetAmount: 3_000_000,
      createdAt: ago(10 * DAY),
    },
    {
      // 목표를 채워서 기부가 닫힌 기부처 (is_active = false)
      targetId: 5,
      targetName: "맑은바다 지킴이",
      description: "해안 정화 활동에 쓰는 장비를 마련했어요.",
      targetImage: null,
      isActive: false,
      totalDonation: 2_500_000,
      targetAmount: 2_500_000,
      createdAt: ago(60 * DAY),
    },
  ];

  const nameOf = (id: number) => targets.find((t) => t.targetId === id)?.targetName ?? "";
  const seed = (
    donationId: number,
    targetId: number,
    donorName: string,
    donationAmount: number,
    createdAt: string,
  ): DonationRecord => ({
    donationId,
    targetId,
    targetName: nameOf(targetId),
    donorName,
    donationAmount,
    createdAt,
  });

  return {
    balance: 52_000,
    targets,
    donations: [
      seed(201, 2, "김**", 185_000, ago(35 * MINUTE)),
      seed(200, 1, "이**", 42_000, ago(3 * HOUR)),
      seed(199, 3, "박**", 68_000, ago(7 * HOUR)),
      seed(198, 1, "정**", 120_000, ago(1 * DAY)),
      seed(197, 4, "최**", 55_000, ago(2 * DAY)),
      seed(196, 2, "오**", 20_000, ago(3 * DAY)),
      seed(195, 1, "한**", 75_000, ago(4 * DAY)),
      seed(194, 3, "서**", 30_000, ago(5 * DAY)),
      seed(193, 1, "윤**", 10_000, ago(6 * DAY)),
      seed(192, 2, "강**", 90_000, ago(8 * DAY)),
      seed(191, 4, "조**", 25_000, ago(9 * DAY)),
      seed(190, 5, "임**", 150_000, ago(11 * DAY)),
    ],
    counts: {
      1: { donors: 9, count: 14 },
      2: { donors: 6, count: 10 },
      3: { donors: 5, count: 8 },
      4: { donors: 4, count: 5 },
      5: { donors: 4, count: 4 },
    },
    points: [
      {
        pointId: 306,
        pointType: "사용",
        pointAmount: 20_000,
        description: "푸른숲 어린이 도서관 기부",
        createdAt: ago(2 * HOUR),
      },
      {
        pointId: 305,
        pointType: "적립",
        pointAmount: 45_000,
        description: "경매 판매 대금 적립",
        createdAt: ago(1 * DAY),
      },
      {
        pointId: 304,
        pointType: "사용",
        pointAmount: 10_000,
        description: "다온 유기동물 보호소 기부",
        createdAt: ago(3 * DAY),
      },
      {
        pointId: 303,
        pointType: "적립",
        pointAmount: 30_000,
        description: "포인트 충전",
        createdAt: ago(5 * DAY),
      },
      {
        pointId: 302,
        pointType: "사용",
        pointAmount: 8_000,
        description: "한결 어르신 돌봄 기부",
        createdAt: ago(9 * DAY),
      },
      {
        pointId: 301,
        pointType: "적립",
        pointAmount: 15_000,
        description: "경매 판매 대금 적립",
        createdAt: ago(12 * DAY),
      },
    ],
    myTargets: new Set<number>(),
    nextDonationId: 202,
    nextPointId: 307,
  };
}

/* ---------- 기부 현황 (목록 페이지) ---------- */

export async function getDonationSummary(): Promise<DonationSummary> {
  // ▼ 백엔드가 준비되면 아래 mock 대신 이렇게 바꾸세요.
  //
  // const res = await fetch(`${process.env.API_BASE_URL}/api/donations/summary`, {
  //   next: { revalidate: 30 }, // 30초마다 갱신. 항상 최신이어야 하면 { cache: 'no-store' }
  // });
  // if (!res.ok) throw new Error('기부 현황을 불러오지 못했어요.');
  // return res.json();
  //
  // API_BASE_URL은 frontend/.env.local 에 적어 두세요. (예: API_BASE_URL=http://localhost:8080)
  //
  // 백엔드는 대략 이렇게 만들어 주면 됩니다.
  //  - totalDonation : SELECT SUM(donation_amount) FROM donations
  //  - donationCount : SELECT COUNT(*) FROM donations
  //  - donorCount    : SELECT COUNT(DISTINCT user_id) FROM donations
  //  - targets       : SELECT * FROM donation_targets
  //  - recentDonations : donations 최신순 5건 + donation_targets.target_name + 회원 이름(마스킹)

  const store = getStore();
  return {
    totalDonation: store.targets.reduce((sum, t) => sum + t.totalDonation, 0),
    donationCount: Object.values(store.counts).reduce((sum, c) => sum + c.count, 0),
    donorCount: 17 + (store.myTargets.size > 0 ? 1 : 0),
    targets: store.targets.map((t) => ({ ...t })),
    recentDonations: store.donations.slice(0, 5).map((d) => ({ ...d })),
  };
}

/* ---------- 내 포인트 ---------- */

// 지금 로그인한 사용자의 포인트예요. 로그인하지 않았으면 null을 돌려줘요.
export async function getMyPoints(): Promise<MyPoints | null> {
  // ▼ 백엔드가 준비되면 아래 mock 대신 이렇게 바꾸세요. (인증 방식은 팀이 정한 대로 맞추세요)
  //
  // import { cookies } from "next/headers";   // 파일 맨 위에 추가
  //
  // const token = (await cookies()).get("accessToken")?.value;
  // if (!token) return null;                  // 로그인하지 않음
  // const res = await fetch(`${process.env.API_BASE_URL}/api/me/points`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   cache: "no-store",                      // 사람마다 다른 값이라 캐시하지 않아요
  // });
  // if (res.status === 401) return null;
  // if (!res.ok) throw new Error("포인트를 불러오지 못했어요.");
  // return res.json();
  //
  // 백엔드는 대략 이렇게 만들어 주면 됩니다.
  //  - balance : point_histories에서 이 사용자의 적립 합계 - 사용 합계
  //              (회원 테이블에 잔액 컬럼이 따로 있다면 그 값을 써도 돼요)
  //  - recent  : 이 사용자의 point_histories 최신순 8건
  //              (donation_id가 있으면 "○○ 기부", auction_id가 있으면 경매 관련 문구로 description을 채우기)

  if (!MOCK_LOGGED_IN) return null;
  const store = getStore();
  return { balance: store.balance, recent: store.points.slice(0, 8).map((p) => ({ ...p })) };
}

/* ---------- 기부처 상세 ---------- */

// 기부처 한 곳의 정보예요. 없는 기부처면 null을 돌려줘요. (비활성 기부처도 돌려줘요)
export async function getDonationTarget(targetId: number): Promise<DonationTargetDetail | null> {
  // ▼ 백엔드가 준비되면 아래 mock 대신 이렇게 바꾸세요.
  //
  // const res = await fetch(`${process.env.API_BASE_URL}/api/donation-targets/${targetId}`, {
  //   next: { revalidate: 30 },
  // });
  // if (res.status === 404) return null;
  // if (!res.ok) throw new Error("기부처를 불러오지 못했어요.");
  // return res.json();
  //
  // 백엔드는 대략 이렇게 만들어 주면 됩니다.
  //  - target          : SELECT * FROM donation_targets WHERE target_id = ?
  //  - donorCount      : SELECT COUNT(DISTINCT user_id) FROM donations WHERE target_id = ?
  //  - donationCount   : SELECT COUNT(*) FROM donations WHERE target_id = ?
  //  - recentDonations : 이 기부처의 donations 최신순 8건 + 회원 이름(마스킹)

  const store = getStore();
  const target = store.targets.find((t) => t.targetId === targetId);
  if (!target) return null;

  const counts = store.counts[targetId] ?? { donors: 0, count: 0 };
  return {
    target: { ...target },
    donorCount: counts.donors,
    donationCount: counts.count,
    recentDonations: store.donations
      .filter((d) => d.targetId === targetId)
      .slice(0, 8)
      .map((d) => ({ ...d })),
  };
}

/* ---------- 기부하기 ---------- */

// 포인트로 기부해요. 실패하면 이유를 에러 코드로 돌려줘요.
export async function donate(input: { targetId: number; amount: number }): Promise<DonateResult> {
  // ▼ 백엔드가 준비되면 아래 mock 대신 이렇게 바꾸세요.
  //
  // const token = (await cookies()).get("accessToken")?.value;
  // if (!token) return { ok: false, code: "NOT_LOGGED_IN" };
  // const res = await fetch(`${process.env.API_BASE_URL}/api/donations`, {
  //   method: "POST",
  //   headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
  //   body: JSON.stringify({ targetId: input.targetId, amount: input.amount }),
  //   cache: "no-store",
  // });
  // const data = await res.json();
  // if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };   // 예: INSUFFICIENT_POINT
  // return { ok: true, amount: data.amount, balance: data.balance };
  //
  // 백엔드가 꼭 지켜야 할 것 (화면 검증은 믿지 않아요)
  //  - 금액이 최소 금액·단위에 맞는지, 잔액이 충분한지, 기부처가 열려 있는지 서버에서 다시 검사
  //  - 아래 네 가지를 하나의 트랜잭션으로 처리
  //      1) donations에 기록   2) point_histories에 '사용' 기록
  //      3) 사용자 잔액 차감   4) donation_targets.total_donation 증가
  //  - 같은 사용자가 동시에 두 번 눌러도 잔액이 마이너스가 되지 않게 잠금(락)이나 조건부 UPDATE 사용

  if (!MOCK_LOGGED_IN) return { ok: false, code: "NOT_LOGGED_IN" };

  const store = getStore();
  const target = store.targets.find((t) => t.targetId === input.targetId);
  if (!target) return { ok: false, code: "TARGET_NOT_FOUND" };
  if (!target.isActive) return { ok: false, code: "TARGET_CLOSED" };

  const { amount } = input;
  if (!Number.isInteger(amount) || amount < MIN_DONATION || amount % DONATION_STEP !== 0) {
    return { ok: false, code: "INVALID_AMOUNT" };
  }
  if (amount > store.balance) return { ok: false, code: "INSUFFICIENT_POINT" };

  const now = new Date().toISOString();
  store.balance -= amount;
  target.totalDonation += amount;
  store.donations.unshift({
    donationId: store.nextDonationId++,
    targetId: target.targetId,
    targetName: target.targetName,
    donorName: "나**",
    donationAmount: amount,
    createdAt: now,
  });
  store.points.unshift({
    pointId: store.nextPointId++,
    pointType: "사용",
    pointAmount: amount,
    description: `${target.targetName} 기부`,
    createdAt: now,
  });

  const counts = (store.counts[target.targetId] ??= { donors: 0, count: 0 });
  counts.count += 1;
  if (!store.myTargets.has(target.targetId)) {
    store.myTargets.add(target.targetId);
    counts.donors += 1;
  }

  return { ok: true, amount, balance: store.balance };
}
