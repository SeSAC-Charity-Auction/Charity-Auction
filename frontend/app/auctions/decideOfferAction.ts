"use server";

// 낙찰 기회를 수락·포기할 때 서버에서 실행되는 함수예요.

import { revalidatePath } from "next/cache";
import decideOffer from "./decideOffer";
import OfferState from "./OfferState";

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "내 낙찰 기회가 아니에요.",
	CANDIDATE_NOT_FOUND: "낙찰 기회를 찾을 수 없어요.",
	CANDIDATE_NOT_OFFERED: "지금은 선택할 수 없는 낙찰 기회예요.",
	CANDIDATE_EXPIRED: "선택할 수 있는 시간이 지났어요.",
	AUCTION_NOT_AVAILABLE_FOR_ACCEPT: "지금은 낙찰을 수락할 수 없는 경매예요.",
	AUCTION_NOT_AVAILABLE_FOR_REJECT: "지금은 낙찰을 포기할 수 없는 경매예요.",
	UNKNOWN: "처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default async function decideOfferAction(
	_prev: OfferState,
	formData: FormData
): Promise<OfferState> {
	const candidateId = Number(formData.get("candidateId"));
	const decision = formData.get("decision");
	if (
		!Number.isInteger(candidateId) ||
		candidateId <= 0 ||
		(decision !== "accept" && decision !== "reject")
	) {
		return { status: "error", message: MESSAGES.CANDIDATE_NOT_FOUND };
	}

	const result = await decideOffer(candidateId, decision);
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}
	// 경매 상세·목록·마이페이지와, 위쪽 메뉴의 붉은 점까지 새 값으로 다시 그려요.
	revalidatePath("/", "layout");
	if (decision === "accept") {
		return { status: "accepted", pointAmount: result.pointAmount ?? 0 };
	}
	return { status: "rejected" };
}
