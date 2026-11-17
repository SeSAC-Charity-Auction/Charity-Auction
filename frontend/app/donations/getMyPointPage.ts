import authHeaders from "./authHeaders";
import PointPage from "./PointPage";

export default async function getMyPointPage(
	page: number,
	size = 20
): Promise<PointPage | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/me/points/history?page=${page}&size=${size}`,
		{ headers, cache: "no-store" }
	);
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("포인트 내역을 불러오지 못했어요.");
	return res.json();
}
