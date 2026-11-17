import authHeaders from "./authHeaders";

// "내 포인트를 확인했다"고 서버에 알려요. 그동안 쌓인 새 포인트가 있었으면 true를 돌려줘요.
export default async function markPointsSeen(): Promise<boolean> {
	const headers = await authHeaders();
	if (!headers) return false;
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/me/points/seen`,
			{ method: "POST", headers, cache: "no-store" }
		);
		if (!res.ok) return false;
		return (await res.json()).cleared === true;
	} catch {
		return false;
	}
}
