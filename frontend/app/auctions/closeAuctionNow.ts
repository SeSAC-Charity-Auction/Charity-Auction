import authHeaders from "../donations/authHeaders";

// 테스트용: 진행 중인 경매를 지금 바로 마감해요. 백엔드가 local 프로필일 때만 열려 있어요.
// 성공하면 null, 실패하면 백엔드의 오류 코드를 돌려줘요.
export default async function closeAuctionNow(
	auctionId: number
): Promise<string | null> {
	const headers = await authHeaders();
	if (!headers) return "NOT_LOGGED_IN";
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/dev/auctions/${auctionId}/close`,
			{ method: "POST", headers, cache: "no-store" }
		);
		if (res.ok) return null;
		const data = await res.json().catch(() => ({}));
		return data.code ?? "UNKNOWN";
	} catch {
		return "UNKNOWN";
	}
}
