import authHeaders from "../donations/authHeaders";
import MyWinPage from "./MyWinPage";

// 내 낙찰 이력과 그 낙찰로 받은 포인트예요. 로그인하지 않았으면 null이에요. (page는 0부터 시작)
export default async function getMyWins(
	page: number,
	size = 10
): Promise<MyWinPage | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/v1/me/wins?page=${page}&size=${size}`,
		{ headers, cache: "no-store" }
	);
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("낙찰 이력을 불러오지 못했어요.");
	return res.json();
}
