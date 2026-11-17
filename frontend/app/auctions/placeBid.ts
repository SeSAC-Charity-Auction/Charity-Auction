import authHeaders from "../donations/authHeaders";

export type PlaceBidResult =
	| { ok: true; bidPrice: number }
	| { ok: false; code: string };

// 입찰해요. 금액·시간·판매자 본인 여부 검사는 모두 백엔드(BidService)가 해요.
export default async function placeBid(input: {
	auctionId: number;
	bidPrice: number;
}): Promise<PlaceBidResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/${input.auctionId}/bids`,
			{
				method: "POST",
				headers: { "Content-Type": "application/json", ...headers },
				body: JSON.stringify({ bidPrice: input.bidPrice }),
				cache: "no-store"
			}
		);
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, bidPrice: data.bidPrice };
	} catch {
		// 서버에 연결하지 못했거나 응답이 JSON이 아닌 경우
		return { ok: false, code: "UNKNOWN" };
	}
}
