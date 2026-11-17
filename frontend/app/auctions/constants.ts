export const SORTS = [
	{ value: "ending", label: "마감 임박순" },
	{ value: "latest", label: "최신순" },
	{ value: "popular", label: "입찰 많은 순" },
	{ value: "priceAsc", label: "낮은 가격순" },
	{ value: "priceDesc", label: "높은 가격순" }
] as const;

export const STATUS_TABS = [
	{ value: "", label: "전체" },
	{ value: "IN_PROGRESS", label: "진행 중" },
	{ value: "SCHEDULED", label: "예정" },
	{ value: "ENDED", label: "마감" }
] as const;

export const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "내 낙찰 기회가 아니에요.",
	CANDIDATE_NOT_FOUND: "낙찰 기회를 찾을 수 없어요.",
	CANDIDATE_NOT_OFFERED: "지금은 선택할 수 없는 낙찰 기회예요.",
	CANDIDATE_EXPIRED: "선택할 수 있는 시간이 지났어요.",
	AUCTION_NOT_AVAILABLE_FOR_ACCEPT: "지금은 낙찰을 수락할 수 없는 경매예요.",
	AUCTION_NOT_AVAILABLE_FOR_REJECT: "지금은 낙찰을 포기할 수 없는 경매예요.",
	UNKNOWN: "처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export const PAGE_SIZE = 12;

export type PlaceBidResult =
	| { ok: true; bidPrice: number }
	| { ok: false; code: string };
