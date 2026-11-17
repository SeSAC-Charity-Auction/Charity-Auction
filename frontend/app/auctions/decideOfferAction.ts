"use server";

// 낙찰 기회를 수락·포기할 때 서버에서 실행되는 함수예요.

import { revalidatePath } from "next/cache";
import { MESSAGES } from "./constants";
import decideOffer from "./decideOffer";
import OfferState from "./OfferState";

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
