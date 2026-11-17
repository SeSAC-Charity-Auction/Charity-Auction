import DonationPage from "./DonationPage";

export default async function getDonationPage(
	page: number,
	size = 20
): Promise<DonationPage> {
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/donations?page=${page}&size=${size}`,
		{ cache: "no-store" }
	);
	if (!res.ok) throw new Error("기부 목록을 불러오지 못했어요.");
	return res.json();
}
