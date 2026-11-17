import AuctionFilters from "./AuctionFilters";
import AuctionPage from "./AuctionPage";

const PAGE_SIZE = 12;

export default async function getAuctions(
	filters: AuctionFilters
): Promise<AuctionPage> {
	const qs = new URLSearchParams({
		sort: filters.sort,
		page: String(filters.page - 1), // 백엔드는 0부터 시작해요
		size: String(PAGE_SIZE)
	});
	if (filters.categoryId) qs.set("categoryId", String(filters.categoryId));
	if (filters.status) qs.set("status", filters.status);
	if (filters.keyword) qs.set("keyword", filters.keyword);

	const res = await fetch(
		`${process.env.API_BASE_URL}/api/v1/auctions?${qs}`,
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error("경매 목록을 불러오지 못했어요.");
	return res.json();
}
