import authHeaders from "../donations/authHeaders";
import MyAuctionPage from "./MyAuctionPage";

// 내가 올린 경매예요. 로그인하지 않았으면 null이에요. (page는 0부터 시작)
export default async function getMyAuctions(
	page: number,
	size = 10
): Promise<MyAuctionPage | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/v1/me/auctions?page=${page}&size=${size}`,
		{ headers, cache: "no-store" }
	);
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("내가 올린 경매를 불러오지 못했어요.");
	return res.json();
}
