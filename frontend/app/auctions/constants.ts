export const SORTS = [
	{ value: "ENDING_SOON", label: "마감 임박순" },
	{ value: "LATEST", label: "최신순" },
	{ value: "MOST_BIDS", label: "입찰 많은 순" },
	{ value: "LOWEST_PRICE", label: "낮은 가격순" },
	{ value: "HIGHEST_PRICE", label: "높은 가격순" },
	{ value: "STARTING_SOON", label: "시작일 빠른순" }
] as const;

export const STATUS_TABS = [
	{ value: "IN_PROGRESS", label: "진행 중" },
	{ value: "SCHEDULED", label: "예정" },
	{ value: "CLOSED", label: "마감" },
	{ value: "ALL", label: "전체" }
] as const;

// 주소에 상태가 없을 때 보여주는 기본 탭, 그리고 주소에서 생략하는 기본 정렬이에요.
export const DEFAULT_STATUS = "IN_PROGRESS" as const;
export const DEFAULT_SORT = "ENDING_SOON" as const;

export const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "내 낙찰 기회가 아니에요.",
	CANDIDATE_NOT_FOUND: "낙찰 기회를 찾을 수 없어요.",
	CANDIDATE_NOT_OFFERED: "지금은 선택할 수 없는 낙찰 기회예요.",
	CANDIDATE_EXPIRED: "선택할 수 있는 시간이 지났어요.",
	INVALID_TOKEN: "로그인이 만료됐어요. 다시 로그인해 주세요.",
	UNAUTHORIZED: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	AUCTION_NOT_AVAILABLE_FOR_ACCEPT: "지금은 낙찰을 수락할 수 없는 경매예요.",
	AUCTION_NOT_AVAILABLE_FOR_REJECT: "지금은 낙찰을 포기할 수 없는 경매예요.",
	UNKNOWN: "처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export const PAGE_SIZE = 12;

export type PlaceBidResult =
	| { ok: true; bidPrice: number }
	| { ok: false; code: string };
