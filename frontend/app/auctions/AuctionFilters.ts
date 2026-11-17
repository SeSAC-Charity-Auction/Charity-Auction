import { SORTS } from "./constants";

type AuctionFilters = {
	categoryId: number | null;
	status: "" | "IN_PROGRESS" | "SCHEDULED" | "ENDED"; // ""는 전부 (진행 중·예정을 먼저, 마감은 뒤에)
	sort: (typeof SORTS)[number]["value"];
	keyword: string;
	page: number; // 1부터 시작
};

export default AuctionFilters;
