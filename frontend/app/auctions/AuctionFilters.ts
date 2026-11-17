// 주소(?category=&status=&sort=&q=&page=)에서 읽은, 화면에 적용된 조건이에요.
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
	{ value: "SCHEDULED", label: "예정" }
] as const;

type AuctionFilters = {
	categoryId: number | null;
	status: "" | "IN_PROGRESS" | "SCHEDULED"; // ""는 진행+예정 모두
	sort: (typeof SORTS)[number]["value"];
	keyword: string;
	page: number; // 1부터 시작
};

export default AuctionFilters;
