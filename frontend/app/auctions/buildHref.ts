import AuctionFilters from "./AuctionFilters";

// 지금 조건에서 일부만 바꾼 주소를 만들어요. 기본값은 주소에서 빼서 짧게 유지해요.
// 조건(카테고리·정렬 등)을 바꾸면 1쪽부터 다시 보여줘요.
export default function buildHref(
	current: AuctionFilters,
	changes: Partial<AuctionFilters>
) {
	const next = { ...current, page: 1, ...changes };
	const qs = new URLSearchParams();
	if (next.categoryId) qs.set("category", String(next.categoryId));
	if (next.status) qs.set("status", next.status);
	if (next.sort !== "ending") qs.set("sort", next.sort);
	if (next.keyword) qs.set("q", next.keyword);
	if (next.page > 1) qs.set("page", String(next.page));
	const s = qs.toString();
	return s ? `/?${s}` : "/";
}
