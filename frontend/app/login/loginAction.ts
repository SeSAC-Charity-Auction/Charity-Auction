"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import startSession from "../auth/startSession";
import LoginState from "./LoginState";
import safeNext from "./safeNext";

const MESSAGES = {
	EMPTY: "이메일과 비밀번호를 모두 입력해 주세요.",
	LOGIN_FAILED: "이메일 또는 비밀번호가 올바르지 않아요.",
	UNKNOWN: "로그인하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default async function loginAction(
	_prev: LoginState,
	formData: FormData
): Promise<LoginState> {
	const email = String(formData.get("email") ?? "").trim();
	const password = String(formData.get("password") ?? "");
	const next = safeNext(formData.get("next"));
	if (!email || !password) {
		return { status: "error", email, message: MESSAGES.EMPTY };
	}

	const result = await startSession(email, password);
	if (result !== "ok") {
		return { status: "error", email, message: MESSAGES[result] };
	}

	revalidatePath("/", "layout");
	redirect(next);
}
