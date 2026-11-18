import authHeaders from "../donations/authHeaders";
import DecideOfferResult from "./DecideOfferResult";

// 낙찰 기회를 수락하거나 포기해요. 기한·본인 확인과 포인트 지급은 모두 백엔드가 해요.
export default async function decideOffer(
	candidateId: number,
	decision: "accept" | "reject"
): Promise<DecideOfferResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auction-candidates/${candidateId}/${decision}`,
			{ method: "POST", headers, cache: "no-store" }
		);
		// 실패 응답(ErrorResponse)은 { code, message, ... } 모양이에요. 본문이 비어 있을 수도 있어요.
		const data = await res.json().catch(() => ({}));
		if (!res.ok) {
			if (res.status === 401 && !data.code) {
				return { ok: false, code: "NOT_LOGGED_IN" };
			}
			return { ok: false, code: data.code ?? "UNKNOWN" };
		}
		return { ok: true, pointAmount: data.pointAmount ?? null };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
