import authHeaders from "../donations/authHeaders";

// 지금 선택을 기다리는 내 낙찰 기회가 몇 건인지 알려줘요. (위쪽 메뉴 배지용)
// 로그인하지 않았거나 못 불러오면 0이에요. 메뉴가 깨지지 않게 오류는 삼켜요.
export default async function getMyOfferCount(): Promise<number> {
	const headers = await authHeaders();
	if (!headers) return 0;
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auction-candidates/my/status?status=OFFERED`,
			{ headers, cache: "no-store" }
		);
		if (!res.ok) return 0;
		const offers: unknown[] = await res.json();
		return offers.length;
	} catch {
		return 0;
	}
}
