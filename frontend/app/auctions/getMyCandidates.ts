import authHeaders from "../donations/authHeaders";
import MyCandidate from "./MyCandidate";

// 내 낙찰 후보 전체 (최근 것부터). 로그인하지 않았으면 null이에요.
export default async function getMyCandidates(): Promise<MyCandidate[] | null> {
	const headers = await authHeaders();
	if (!headers) return null;
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/v1/auction-candidates/my/all`,
		{ headers, cache: "no-store" }
	);
	if (res.status === 401) return null;
	if (!res.ok) throw new Error("낙찰 기회 내역을 불러오지 못했어요.");
	return res.json();
}
