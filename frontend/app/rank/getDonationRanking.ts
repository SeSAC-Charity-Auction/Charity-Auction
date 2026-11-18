import type DonationRanking from "./DonationRanking";

export default async function getDonationRanking(): Promise<DonationRanking[] | null> {
	try {
		const response = await fetch(
			`${process.env.API_BASE_URL}/api/donations/ranking`,
			{ cache: "no-store", signal: AbortSignal.timeout(10_000) }
		);
		if (!response.ok) return null;
		const data: unknown = await response.json();
		if (!Array.isArray(data)) return null;
		return data as DonationRanking[];
	} catch {
		return null;
	}
}
