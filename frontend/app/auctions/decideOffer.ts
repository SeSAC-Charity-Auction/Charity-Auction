import authHeaders from "../donations/authHeaders";

export type DecideOfferResult =
	| { ok: true; pointAmount: number | null }
	| { ok: false; code: string };

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
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, pointAmount: data.pointAmount ?? null };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
