import authHeaders from "./authHeaders";
import MyDonationPage from "./MyDonationPage";

// 내 기부 이력이에요. 로그인하지 않았으면 null이에요. (page는 0부터 시작)
export default async function getMyDonations(
	page: number,
	size = 10
): Promise<MyDonationPage | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/me/donations?page=${page}&size=${size}`,
		{ headers, cache: "no-store" }
	);
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("기부 이력을 불러오지 못했어요.");
	return res.json();
}
