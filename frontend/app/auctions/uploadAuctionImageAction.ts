"use server";

// 경매 물품 이미지를 올릴 때 서버에서 실행되는 함수예요. (개발 환경에서만 화면에 나와요)

import { revalidatePath } from "next/cache";
import AuctionImageState from "./AuctionImageState";
import uploadAuctionImage from "./uploadAuctionImage";

const MAX_BYTES = 2 * 1024 * 1024;

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "개발 환경에서만 이미지를 바꿀 수 있어요.",
	AUCTION_NOT_FOUND: "경매를 찾을 수 없어요.",
	INVALID_IMAGE: "PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.",
	IMAGE_TOO_LARGE: "이미지는 2MB 이하만 올릴 수 있어요.",
	UNKNOWN: "이미지를 올리지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default async function uploadAuctionImageAction(
	_prev: AuctionImageState,
	formData: FormData
): Promise<AuctionImageState> {
	// 개발 환경이 아니면 화면에 올리기 버튼이 없지만, 요청은 조작될 수 있어서 여기서도 막아요.
	if (process.env.NODE_ENV !== "development") {
		return { status: "error", message: MESSAGES.FORBIDDEN };
	}
	const auctionId = Number(formData.get("auctionId"));
	const file = formData.get("file");
	if (!Number.isInteger(auctionId) || auctionId <= 0) {
		return { status: "error", message: MESSAGES.AUCTION_NOT_FOUND };
	}
	if (!(file instanceof File) || file.size === 0) {
		return { status: "error", message: MESSAGES.INVALID_IMAGE };
	}
	if (file.size > MAX_BYTES) {
		return { status: "error", message: MESSAGES.IMAGE_TOO_LARGE };
	}
	const result = await uploadAuctionImage(auctionId, file);
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}
	// 메인 목록과 이 경매 상세가 새 이미지로 다시 그려지게 해요.
	revalidatePath("/");
	revalidatePath(`/auctions/${auctionId}`);
	return { status: "success" };
}
