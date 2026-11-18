import authHeaders from "../donations/authHeaders";
import { PlaceBidResult } from "./constants";

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
		// 실패 응답(ErrorResponse)은 { code, message, ... } 모양이에요. 본문이 비어 있을 수도 있어요.
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			if (res.status === 401 && !data.code) {
				return { ok: false, code: "NOT_LOGGED_IN" };
			}
			return { ok: false, code: data.code ?? "UNKNOWN" };
		}
		return { ok: true, bidPrice: data.bidPrice };
	} catch {
		// 서버에 연결하지 못했거나 응답이 JSON이 아닌 경우
		return { ok: false, code: "UNKNOWN" };
	}
}
