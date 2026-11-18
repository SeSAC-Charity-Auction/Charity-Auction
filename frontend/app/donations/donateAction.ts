"use server";

// app/donations/actions.ts
// 기부 폼이 제출될 때 서버에서 실행되는 함수예요. (브라우저가 아니라 서버에서만 돌아요)

import { revalidatePath } from "next/cache";
import DonateErrorCode from "./DonateErrorCode";
import DonateState from "./DonateState";
import { DONATION_STEP, MIN_DONATION } from "./rules";
import donate from "./donate";

const MESSAGES: Record<DonateErrorCode, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	TARGET_NOT_FOUND: "기부처를 찾을 수 없어요.",
	TARGET_CLOSED: "이 기부처는 기부가 마감됐어요.",
	INVALID_AMOUNT: `기부 포인트는 ${MIN_DONATION.toLocaleString("ko-KR")}P 이상, ${DONATION_STEP.toLocaleString("ko-KR")}P 단위로 정해 주세요.`,
	DONATION_EXCEEDS_TARGET:
		"목표 금액까지 남은 금액보다 많이 기부할 수 없어요. 슬라이더에서 금액을 줄여 보세요.",
	INSUFFICIENT_POINT: "포인트가 부족해요. 슬라이더에서 금액을 줄여 보세요.",
	UNKNOWN: "기부를 처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export async function donateAction(
	_prev: DonateState,
	formData: FormData
): Promise<DonateState> {
	// 화면에서 한 번 검사하지만, 요청은 얼마든지 조작될 수 있어서 서버에서 다시 확인해요.
	const targetId = Number(formData.get("targetId"));
	const amount = Number(formData.get("amount"));
	if (!Number.isInteger(targetId) || targetId <= 0) {
		return { status: "error", message: MESSAGES.TARGET_NOT_FOUND };
	}
	if (!Number.isInteger(amount)) {
		return { status: "error", message: MESSAGES.INVALID_AMOUNT };
	}
	const result = await donate({ targetId, amount });
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}
	// 기부 현황(목록)과 이 기부처 상세가 새 값으로 다시 그려지게 해요.
	revalidatePath("/donations");
	revalidatePath(`/donations/${targetId}`);
	return {
		status: "success",
		amount: result.amount,
		balance: result.balance
	};
}
