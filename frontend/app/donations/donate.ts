import authHeaders from "./authHeaders";
import DonateResult from "./DonateResult";

export default async function donate(input: {
	targetId: number;
	amount: number;
}): Promise<DonateResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/donations`, {
			method: "POST",
			headers: { "Content-Type": "application/json", ...headers },
			body: JSON.stringify({
				targetId: input.targetId,
				amount: input.amount
			}),
			cache: "no-store"
		});
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" }; // 예: INSUFFICIENT_POINT
		return { ok: true, amount: data.amount, balance: data.balance };
	} catch {
		// 서버에 연결하지 못했거나 응답이 JSON이 아닌 경우
		return { ok: false, code: "UNKNOWN" };
	}
	// 금액·잔액·마감 여부 검사와 트랜잭션 처리는 모두 백엔드(DonationService)가 해요.
}
