import AuctionForEdit from "./AuctionForEdit";

export default function editability(
	auction: AuctionForEdit
): { editable: true } | { editable: false; reason: string } {
	if (auction.status !== "SCHEDULED") {
		return {
			editable: false,
			reason: "이미 시작했거나 끝난 경매라 수정할 수 없어요. 경매는 시작 전에만 수정할 수 있어요."
		};
	}
	if (auction.bidCount > 0) {
		return { editable: false, reason: "입찰이 들어온 경매는 수정할 수 없어요." };
	}
	return { editable: true };
}
