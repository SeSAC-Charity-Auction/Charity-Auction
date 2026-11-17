import DonationSummary from "./DonationSummary";

export async function getDonationSummary(): Promise<DonationSummary> {
	// 서버(Next.js)가 Spring에서 매번 최신 값을 가져와요. 합계·횟수·최근 기부는 DB에서 계산해서 내려줘요.
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/donations/summary`,
		{
			cache: "no-store" // 캐시하지 않고 접속할 때마다 DB의 최신 값을 가져와요
		}
	);
	if (!res.ok) throw new Error("기부 현황을 불러오지 못했어요.");
	return res.json();
}
