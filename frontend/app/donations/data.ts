// app/donations/data.ts
// ERD의 donation_targets / donations 테이블을 그대로 옮긴 타입과 가짜(mock) 데이터입니다.
// 백엔드 API가 준비되면 getDonationSummary 안쪽만 fetch로 바꾸면 되고, 화면(page.tsx)은 그대로 둬도 돼요.

// donation_targets 테이블 한 행 (기부 대상)
export type DonationTarget = {
	targetId: number; // target_id
	targetName: string; // target_name
	description: string | null; // description (NULL 가능)
	targetImage: string | null; // target_image (NULL 가능, 이미지 주소)
	isActive: boolean; // is_active (기부 가능 여부)
	totalDonation: number; // total_donation (누적 기부금, 원)
	targetAmount: number; // target_amount (목표 기부금, 원)
	createdAt: string; // created_at (ISO 8601)
};

// donations 테이블 한 행 + 화면에 필요한 이름 두 개
export type DonationRecord = {
	donationId: number; // donation_id
	targetId: number; // target_id
	targetName: string; // donation_targets.target_name (JOIN)
	donorName: string; // 회원 테이블의 이름·닉네임을 서버에서 마스킹한 값 (예: 김**)
	donationAmount: number; // donation_amount (원)
	createdAt: string; // created_at (ISO 8601)
};

export type DonationSummary = {
	totalDonation: number; // 전체 기부금 합계
	donationCount: number; // 기부 횟수 (donations 행 수)
	donorCount: number; // 기부한 사람 수 (user_id 중복 제거)
	targets: DonationTarget[]; // 기부처 목록 (비활성 포함, 거르는 건 화면에서)
	recentDonations: DonationRecord[]; // 최신순
};

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
const MINUTE = 60 * 1000;
const ago = (ms: number) => new Date(Date.now() - ms).toISOString();

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
			createdAt: ago(40 * DAY)
		},
		{
			targetId: 2,
			targetName: "다온 유기동물 보호소",
			description: "추운 겨울을 나는 보호소의 난방비와 사료를 지원해요.",
			targetImage: null,
			isActive: true,
			totalDonation: 3_150_000,
			targetAmount: 5_000_000,
			createdAt: ago(32 * DAY)
		},
		{
			targetId: 3,
			targetName: "한결 어르신 돌봄",
			description: "혼자 지내시는 어르신께 따뜻한 도시락을 전해요.",
			targetImage: null,
			isActive: true,
			totalDonation: 1_900_000,
			targetAmount: 4_000_000,
			createdAt: ago(25 * DAY)
		},
		{
			targetId: 4,
			targetName: "새움 청소년 쉼터",
			description:
				"청소년이 안전하게 머물고 공부할 수 있는 공간을 만들어요.",
			targetImage: null,
			isActive: true,
			totalDonation: 520_000,
			targetAmount: 3_000_000,
			createdAt: ago(10 * DAY)
		},
		{
			// 목표를 채워서 기부가 닫힌 기부처 (is_active = false). 화면에는 나오지 않아요.
			targetId: 5,
			targetName: "맑은바다 지킴이",
			description: "해안 정화 활동에 쓰는 장비를 마련했어요.",
			targetImage: null,
			isActive: false,
			totalDonation: 2_500_000,
			targetAmount: 2_500_000,
			createdAt: ago(60 * DAY)
		}
	];

	return {
		totalDonation: targets.reduce((sum, t) => sum + t.totalDonation, 0),
		donationCount: 41,
		donorCount: 17,
		targets,
		recentDonations: [
			{
				donationId: 201,
				targetId: 2,
				targetName: "다온 유기동물 보호소",
				donorName: "김**",
				donationAmount: 185_000,
				createdAt: ago(35 * MINUTE)
			},
			{
				donationId: 200,
				targetId: 1,
				targetName: "푸른숲 어린이 도서관",
				donorName: "이**",
				donationAmount: 42_000,
				createdAt: ago(3 * HOUR)
			},
			{
				donationId: 199,
				targetId: 3,
				targetName: "한결 어르신 돌봄",
				donorName: "박**",
				donationAmount: 68_000,
				createdAt: ago(7 * HOUR)
			},
			{
				donationId: 198,
				targetId: 1,
				targetName: "푸른숲 어린이 도서관",
				donorName: "정**",
				donationAmount: 120_000,
				createdAt: ago(1 * DAY)
			},
			{
				donationId: 197,
				targetId: 4,
				targetName: "새움 청소년 쉼터",
				donorName: "최**",
				donationAmount: 55_000,
				createdAt: ago(2 * DAY)
			}
		]
	};
}

// point_histories 테이블 한 행 + 화면에 필요한 설명 문구
export type PointEntry = {
	pointId: number; // point_id
	pointType: "적립" | "사용"; // point_type
	pointAmount: number; // point_amount (크기만 쓰고, 더할지 뺄지는 pointType으로 정해요. 사용이 음수여도 괜찮아요)
	description: string; // auction_id / donation_id를 보고 서버가 만든 문구 (예: "푸른숲 어린이 도서관 기부")
	createdAt: string; // created_at (ISO 8601)
};

export type MyPoints = {
	balance: number; // 지금 쓸 수 있는 포인트
	recent: PointEntry[]; // 최신순으로 6~8건 정도 (그래프를 그리는 데 쓰여요)
};

// 개발 중에 로그인하지 않은 화면을 보고 싶으면 false로 바꿔 보세요.
const MOCK_LOGGED_IN = true;

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

	return {
		balance: 52_000,
		recent: [
			{
				pointId: 306,
				pointType: "사용",
				pointAmount: 20_000,
				description: "푸른숲 어린이 도서관 기부",
				createdAt: ago(2 * HOUR)
			},
			{
				pointId: 305,
				pointType: "적립",
				pointAmount: 45_000,
				description: "경매 판매 대금 적립",
				createdAt: ago(1 * DAY)
			},
			{
				pointId: 304,
				pointType: "사용",
				pointAmount: 10_000,
				description: "다온 유기동물 보호소 기부",
				createdAt: ago(3 * DAY)
			},
			{
				pointId: 303,
				pointType: "적립",
				pointAmount: 30_000,
				description: "포인트 충전",
				createdAt: ago(5 * DAY)
			},
			{
				pointId: 302,
				pointType: "사용",
				pointAmount: 8_000,
				description: "한결 어르신 돌봄 기부",
				createdAt: ago(9 * DAY)
			},
			{
				pointId: 301,
				pointType: "적립",
				pointAmount: 15_000,
				description: "경매 판매 대금 적립",
				createdAt: ago(12 * DAY)
			}
		]
	};
}
