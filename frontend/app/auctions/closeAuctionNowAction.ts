"use server";

// 테스트용으로 경매를 바로 마감할 때 서버에서 실행되는 함수예요. (개발 환경에서만 화면에 나와요)

import { revalidatePath } from "next/cache";
import AuctionImageState from "./AuctionImageState";
import closeAuctionNow from "./closeAuctionNow";

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "개발 환경에서만 쓸 수 있어요.",
	AUCTION_NOT_FOUND: "경매를 찾을 수 없어요.",
	AUCTION_NOT_IN_PROGRESS: "진행 중인 경매가 아니에요.",
	UNKNOWN: "마감하지 못했어요. 백엔드가 local 프로필로 실행 중인지 확인해 주세요."
};

export default async function closeAuctionNowAction(
	_prev: AuctionImageState,
	formData: FormData
): Promise<AuctionImageState> {
	// 개발 환경이 아니면 화면에 버튼이 없지만, 요청은 조작될 수 있어서 여기서도 막아요.
	if (process.env.NODE_ENV !== "development") {
		return { status: "error", message: MESSAGES.FORBIDDEN };
	}
	const auctionId = Number(formData.get("auctionId"));
	if (!Number.isInteger(auctionId) || auctionId <= 0) {
		return { status: "error", message: MESSAGES.AUCTION_NOT_FOUND };
	}
	const code = await closeAuctionNow(auctionId);
	if (code) {
		return { status: "error", message: MESSAGES[code] ?? MESSAGES.UNKNOWN };
	}
	// 목록과 이 경매 상세가 마감된 모습으로 다시 그려지게 해요.
	revalidatePath("/");
	revalidatePath(`/auctions/${auctionId}`);
	return { status: "success" };
}
