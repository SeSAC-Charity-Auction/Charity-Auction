import AuctionDetail from "./AuctionDetail";

// 경매 한 건이에요. 없거나 삭제된 경매면 null을 돌려줘요.
export default async function getAuction(
	auctionId: number
): Promise<AuctionDetail | null> {
	const res = await fetch(
		`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}`,
		{ cache: "no-store" }
	);
	if (res.status === 404) return null;
	if (!res.ok) throw new Error("경매 정보를 불러오지 못했어요.");
	return res.json();
}
