"use server";

import { revalidatePath } from "next/cache";
import changeMyNickname from "../donations/changeMyNickname";
import { NICKNAME_MESSAGES } from "./constants";
import NicknameState from "./NicknameState";

export default async function changeNicknameAction(
	_prev: NicknameState,
	formData: FormData
): Promise<NicknameState> {
	// 화면에서도 검사하지만, 요청은 조작될 수 있어서 서버에서 다시 확인해요.
	const nickname = String(formData.get("nickname") ?? "").trim();
	if (nickname.length < 2 || nickname.length > 10) {
		return { status: "error", message: NICKNAME_MESSAGES.INVALID_NICKNAME };
	}
	const result = await changeMyNickname(nickname);
	if (!result.ok) {
		return {
			status: "error",
			message: NICKNAME_MESSAGES[result.code] ?? NICKNAME_MESSAGES.UNKNOWN
		};
	}
	revalidatePath("/mypage");
	return { status: "success", nickname: result.nickname };
}
