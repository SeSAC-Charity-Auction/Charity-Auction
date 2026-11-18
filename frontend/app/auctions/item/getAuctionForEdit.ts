import authHeaders from "../../donations/authHeaders";
import AuctionForEdit from "./AuctionForEdit";

export type AuctionForEditResult =
	| { kind: "ok"; auction: AuctionForEdit }
	| { kind: "notFound" }
	| { kind: "loginRequired" }
	| { kind: "error" };

export default async function getAuctionForEdit(
	auctionId: number
): Promise<AuctionForEditResult> {
	const headers = await authHeaders();
	if (!headers) return { kind: "loginRequired" };
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}/v2`,
			{ headers, cache: "no-store" }
		);
		if (res.status === 404) return { kind: "notFound" };
		if (res.status === 401) return { kind: "loginRequired" };
		if (!res.ok) return { kind: "error" };
		return { kind: "ok", auction: await res.json() };
	} catch {
		return { kind: "error" };
	}
}
