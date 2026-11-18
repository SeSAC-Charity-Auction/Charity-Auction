const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 다시 로그인한 뒤 시도해 주세요.",
	UNAUTHORIZED: "로그인이 필요해요. 다시 로그인한 뒤 시도해 주세요.",
	INVALID_TOKEN: "로그인이 만료됐어요. 다시 로그인한 뒤 시도해 주세요.",
	INVALID_IMAGE: "PNG, JPG, GIF, WEBP 이미지만 올릴 수 있어요.",
	IMAGE_TOO_LARGE: "이미지는 2MB 이하만 올릴 수 있어요.",
	CATEGORY_NOT_FOUND: "없는 카테고리예요. 카테고리를 다시 골라 주세요.",
	RESOURCE_NOT_FOUND: "없는 카테고리예요. 카테고리를 다시 골라 주세요.",
	INVALID_START_PRICE: "시작 가격은 1,000원 이상이어야 해요.",
	INVALID_AUCTION_TIME:
		"시작 시각은 지금보다 뒤, 마감 시각은 시작 시각보다 뒤여야 해요.",
	AUCTION_NOT_FOUND: "경매를 찾을 수 없어요. 삭제됐을 수 있어요.",
	AUCTION_NOT_SCHEDULED: "이미 시작된 경매라 수정할 수 없어요.",
	AUCTION_ALREADY_STARTED: "이미 시작된 경매라 수정할 수 없어요.",
	AUCTION_HAS_BIDS: "입찰이 들어온 경매는 수정할 수 없어요.",
	AUCTION_ACCESS_DENIED: "내가 등록한 경매만 수정할 수 있어요.",
	FORBIDDEN: "내가 등록한 경매만 수정할 수 있어요.",
	UNKNOWN: "처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default function itemMessage(code: string, serverMessage?: string): string {
	if (
		(code === "INVALID_INPUT_VALUE" || code === "INVALID_AUCTION_TIME") &&
		serverMessage
	) {
		return serverMessage;
	}
	return MESSAGES[code] ?? MESSAGES.UNKNOWN;
}

export async function readErrorCode(
	res: Response
): Promise<{ code: string; message?: string }> {
	try {
		const data = await res.json();
		return { code: data?.code ?? "UNKNOWN", message: data?.message };
	} catch {
		return { code: res.status === 401 ? "NOT_LOGGED_IN" : "UNKNOWN" };
	}
}
