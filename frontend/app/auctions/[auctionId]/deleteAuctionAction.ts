"use server";

// 경매 삭제 버튼을 누르면 서버에서 실행돼요.
// 삭제할 수 있는지(판매자 본인, 시작 전, 입찰 없음)는 백엔드가 최종 판단해요. (Auction.delete)

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import authHeaders from "../../donations/authHeaders";
import itemMessage, { readErrorCode } from "../item/itemMessages";
import DeleteState from "./DeleteState";

// 수정과 같은 오류 코드를 쓰지만, 문구는 "삭제"에 맞게 바꿔요.
const DELETE_MESSAGES: Record<string, string> = {
	AUCTION_NOT_SCHEDULED: "이미 시작된 경매라 삭제할 수 없어요.",
	AUCTION_ALREADY_STARTED: "이미 시작된 경매라 삭제할 수 없어요.",
	AUCTION_HAS_BIDS: "입찰이 들어온 경매는 삭제할 수 없어요.",
	AUCTION_ACCESS_DENIED: "내가 등록한 경매만 삭제할 수 있어요.",
	FORBIDDEN: "내가 등록한 경매만 삭제할 수 있어요."
};

export default async function deleteAuctionAction(
	_prev: DeleteState,
	formData: FormData
): Promise<DeleteState> {
	const auctionId = Number(formData.get("auctionId"));
	if (!Number.isInteger(auctionId) || auctionId <= 0) {
		return { status: "error", message: itemMessage("AUCTION_NOT_FOUND") };
	}
	const headers = await authHeaders();
	if (!headers) return { status: "error", message: itemMessage("NOT_LOGGED_IN") };

	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}`,
			{ method: "DELETE", headers, cache: "no-store" }
		);
		// 성공하면 204(본문 없음)예요.
		if (!res.ok) {
			const { code } = await readErrorCode(res);
			return { status: "error", message: DELETE_MESSAGES[code] ?? itemMessage(code) };
		}
	} catch {
		return { status: "error", message: itemMessage("UNKNOWN") };
	}

	// 삭제된 경매가 목록·마이페이지에 남지 않게 다시 그리고, 내 경매가 보이는 마이페이지로 보내요.
	revalidatePath("/");
	revalidatePath(`/auctions/${auctionId}`);
	revalidatePath("/mypage", "layout");
	redirect("/mypage");
}
