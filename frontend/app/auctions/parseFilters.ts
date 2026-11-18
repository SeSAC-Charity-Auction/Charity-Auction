import AuctionFilters from "./AuctionFilters";
import { DEFAULT_SORT, DEFAULT_STATUS, SORTS, STATUS_TABS } from "./constants";
import RawParams from "./RawParams";

const first = (v: string | string[] | undefined) =>
	Array.isArray(v) ? v[0] : v;

// 주소의 값은 누구나 바꿀 수 있어서, 알고 있는 값만 받고 나머지는 기본값으로 돌려요.
// 상태가 없으면 '진행 중'이에요. 전체를 보려면 status=ALL이에요.
export default function parseFilters(params: RawParams): AuctionFilters {
	const category = Number(first(params.category));
	const page = Number(first(params.page));
	const status = first(params.status);
	const sort = first(params.sort);

	return {
		categoryId:
			Number.isInteger(category) && category > 0 ? category : null,
		status:
			STATUS_TABS.find((t) => t.value === status)?.value ??
			DEFAULT_STATUS,
		sort: SORTS.find((s) => s.value === sort)?.value ?? DEFAULT_SORT,
		keyword: (first(params.q) ?? "").trim().slice(0, 50),
		page: Number.isInteger(page) && page >= 1 ? page : 1
	};
}
