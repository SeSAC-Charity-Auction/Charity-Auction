import authHeaders from "./authHeaders";
import MyPoints from "./MyPoints";

export default async function getMyPoints(): Promise<MyPoints | null> {
	const headers = await authHeaders();
	if (!headers) return null; // 로그인하지 않음
	const res = await fetch(`${process.env.API_BASE_URL}/api/me/points`, {
		headers,
		cache: "no-store" // 사람마다 다른 값이라 캐시하지 않아요
	});
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("포인트를 불러오지 못했어요.");
	return res.json();
}
