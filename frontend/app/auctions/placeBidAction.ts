"use server";

// 입찰 폼이 제출될 때 서버에서 실행되는 함수예요. (브라우저가 아니라 서버에서만 돌아요)

import { revalidatePath } from "next/cache";
import BidState from "./BidState";
import placeBid from "./placeBid";

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	BID_PRICE_TOO_LOW:
		"다른 입찰이 먼저 들어왔어요. 현재 입찰가보다 높은 금액을 입력해 주세요.",
	BID_NOT_ALLOWED: "내가 등록한 경매에는 입찰할 수 없어요.",
	AUCTION_NOT_STARTED: "아직 시작되지 않은 경매예요.",
	AUCTION_ALREADY_ENDED: "이미 종료된 경매예요.",
	AUCTION_NOT_IN_PROGRESS: "지금은 입찰할 수 없는 경매예요.",
	AUCTION_NOT_FOUND: "경매를 찾을 수 없어요.",
	AUCTION_DELETED: "삭제된 경매예요.",
	AUCTION_CANCELLED: "취소된 경매예요.",
	INVALID_INPUT_VALUE: "입찰 금액을 다시 확인해 주세요.",
	INVALID_TOKEN: "로그인이 만료됐어요. 다시 로그인해 주세요.",
	UNAUTHORIZED: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	USER_NOT_FOUND: "회원 정보를 찾을 수 없어요. 다시 로그인해 주세요.",
	UNKNOWN: "입찰을 처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default async function placeBidAction(
	_prev: BidState,
	formData: FormData
): Promise<BidState> {
	// 화면에서도 검사하지만, 요청은 조작될 수 있어서 서버에서 다시 확인해요.
	const auctionId = Number(formData.get("auctionId"));
	const bidPrice = Number(formData.get("bidPrice"));
	if (!Number.isInteger(auctionId) || auctionId <= 0) {
		return { status: "error", message: MESSAGES.AUCTION_NOT_FOUND };
	}
	if (!Number.isInteger(bidPrice) || bidPrice <= 0) {
		return {
			status: "error",
			message: "입찰 금액을 숫자로 입력해 주세요."
		};
	}
	const result = await placeBid({ auctionId, bidPrice });
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}
	// 이 경매 상세와 메인 목록이 새 입찰가로 다시 그려지게 해요.
	revalidatePath(`/auctions/${auctionId}`);
	revalidatePath("/");
	return { status: "success", bidPrice: result.bidPrice };
}
