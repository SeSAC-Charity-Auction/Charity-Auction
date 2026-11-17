import authHeaders from "../donations/authHeaders";
import MyOffer from "./MyOffer";

// 이 경매에서 내가 받은 낙찰 기회를 돌려줘요. 없거나 로그인하지 않았으면 null이에요.
export default async function getMyOffer(
	auctionId: number
): Promise<MyOffer | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auction-candidates/my/status?status=OFFERED`,
			{ headers, cache: "no-store" }
		);
		if (!res.ok) return null;
		const offers: MyOffer[] = await res.json();
		return offers.find((o) => o.auctionId === auctionId) ?? null;
	} catch {
		return null;
	}
}
