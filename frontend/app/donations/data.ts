// app/donations/data.ts
// ERD(donation_targets / donations / point_histories)를 옮긴 타입과, Spring 백엔드를 부르는 함수들이에요.
// 모든 데이터는 Next.js 서버가 Spring(API_BASE_URL)에서 가져와요. (브라우저가 직접 부르지 않아요)

import { cookies } from "next/headers";

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

// 마이페이지의 내 정보 (GET /api/me). 필드 이름은 회원 ERD(users)를 따라요.
export type MyProfile = {
  userId: number; // user_id
  email: string; // email
  nickname: string; // nickname
  userImage: string | null; // 프로필 이미지 주소 (없으면 null)
  point: number; // point (지금 기부할 수 있는 포인트)
  createdAt: string; // created_at (가입일시, ISO 8601)
  donationCount: number; // 내가 기부한 횟수
  totalDonation: number; // 내가 기부한 총 포인트
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

/* ---------- 로그인 정보 ---------- */

// 백엔드에 "누가 요청하는지" 알려 주는 헤더를 만들어요. 로그인하지 않았으면 null이에요.
//  1) accessToken 쿠키가 있으면 JWT로 보내요. (로그인 기능이 생기면 이 경로를 쓰게 돼요)
//  2) 없으면 frontend/.env.local의 DEV_USER_ID로 개발용 임시 로그인을 해요.
//     백엔드가 local 프로필일 때만 받아 주는 X-Dev-User-Id 헤더예요. (로그인이 완성되면 지워요)
async function authHeaders(): Promise<Record<string, string> | null> {
  const token = (await cookies()).get("accessToken")?.value;
  if (token) return { Authorization: `Bearer ${token}` };

  const devUserId = process.env.DEV_USER_ID;
  if (devUserId) return { "X-Dev-User-Id": devUserId };

  return null;
}

/* ---------- 기부 현황 (목록 페이지) ---------- */

export async function getDonationSummary(): Promise<DonationSummary> {
  // 서버(Next.js)가 Spring에서 매번 최신 값을 가져와요. 합계·횟수·최근 기부는 DB에서 계산해서 내려줘요.
  const res = await fetch(`${process.env.API_BASE_URL}/api/donations/summary`, {
    cache: "no-store", // 캐시하지 않고 접속할 때마다 DB의 최신 값을 가져와요
  });
  if (!res.ok) throw new Error("기부 현황을 불러오지 못했어요.");
  return res.json();
}

/* ---------- 내 정보 (마이페이지) ---------- */

// 지금 로그인한 사용자의 정보예요. 로그인하지 않았으면 null을 돌려줘요.
export async function getMyProfile(): Promise<MyProfile | null> {
  const headers = await authHeaders();
  if (!headers) return null; // 로그인하지 않음

  const res = await fetch(`${process.env.API_BASE_URL}/api/me`, {
    headers,
    cache: "no-store", // 사람마다 다른 값이라 캐시하지 않아요
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("내 정보를 불러오지 못했어요.");
  return res.json();
}

/* ---------- 내 포인트 ---------- */

// 지금 로그인한 사용자의 포인트예요. 로그인하지 않았으면 null을 돌려줘요.
export async function getMyPoints(): Promise<MyPoints | null> {
  const headers = await authHeaders();
  if (!headers) return null; // 로그인하지 않음

  const res = await fetch(`${process.env.API_BASE_URL}/api/me/points`, {
    headers,
    cache: "no-store", // 사람마다 다른 값이라 캐시하지 않아요
  });
  if (res.status === 401) return null;
  if (!res.ok) throw new Error("포인트를 불러오지 못했어요.");
  return res.json();
}

/* ---------- 기부처 상세 ---------- */

// 기부처 한 곳의 정보예요. 없는 기부처면 null을 돌려줘요. (비활성 기부처도 돌려줘요)
export async function getDonationTarget(targetId: number): Promise<DonationTargetDetail | null> {
  // 없는 기부처면 Spring이 404(TARGET_NOT_FOUND)를 줘요.
  const res = await fetch(`${process.env.API_BASE_URL}/api/donation-targets/${targetId}`, {
    cache: "no-store", // 캐시하지 않아요 (기부 직후에도 항상 최신 값)
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error("기부처를 불러오지 못했어요.");
  return res.json();
}

/* ---------- 기부하기 ---------- */

// 포인트로 기부해요. 실패하면 이유를 에러 코드로 돌려줘요.
export async function donate(input: { targetId: number; amount: number }): Promise<DonateResult> {
  const headers = await authHeaders();
  if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };

  try {
    const res = await fetch(`${process.env.API_BASE_URL}/api/donations`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({ targetId: input.targetId, amount: input.amount }),
      cache: "no-store",
    });
    const data = await res.json();
    if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" }; // 예: INSUFFICIENT_POINT
    return { ok: true, amount: data.amount, balance: data.balance };
  } catch {
    // 서버에 연결하지 못했거나 응답이 JSON이 아닌 경우
    return { ok: false, code: "UNKNOWN" };
  }
  // 금액·잔액·마감 여부 검사와 트랜잭션 처리는 모두 백엔드(DonationService)가 해요.
}
