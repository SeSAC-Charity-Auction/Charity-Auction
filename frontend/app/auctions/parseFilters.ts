import AuctionFilters from "./AuctionFilters";
import { SORTS, STATUS_TABS } from "./constants";
import RawParams from "./RawParams";

const first = (v: string | string[] | undefined) =>
	Array.isArray(v) ? v[0] : v;

// 주소의 값은 누구나 바꿀 수 있어서, 알고 있는 값만 받고 나머지는 기본값으로 돌려요.
export default function parseFilters(params: RawParams): AuctionFilters {
	const category = Number(first(params.category));
	const status = first(params.status) ?? "";
	const sort = first(params.sort);
	const page = Number(first(params.page));
	const selectedStatus = STATUS_TABS.some((t) => t.value === status && t.value !== "") ? (status as AuctionFilters["status"]) : "";
	const selectedSort = SORTS.find((s) => s.value === sort)?.value ?? "ENDING_SOON";

	return {
		categoryId:
			Number.isInteger(category) && category > 0 ? category : null,
		status:
			STATUS_TABS.some((t) => t.value === status && t.value !== "") ?
				(status as AuctionFilters["status"])
			:	"",
		sort: SORTS.find((s) => s.value === sort)?.value ?? "ENDING_SOON",
		keyword: (first(params.q) ?? "").trim().slice(0, 50),
		page: Number.isInteger(page) && page >= 1 ? page : 1
	};
}
