import DonationTargetDetail from "./DonationTargetDetail";

export default async function getDonationTarget(
	targetId: number
): Promise<DonationTargetDetail | null> {
	// 없는 기부처면 Spring이 404(TARGET_NOT_FOUND)를 줘요.
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/donation-targets/${targetId}`,
		{
			cache: "no-store" // 캐시하지 않아요 (기부 직후에도 항상 최신 값)
		}
	);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("기부처를 불러오지 못했어요.");
	return res.json();
}
