"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import startSession from "../auth/startSession";
import safeNext from "../login/safeNext";
import { Field, validateField } from "./rules";
import SignupState from "./SignupState";

const FIELDS: Field[] = ["email", "password", "passwordConfirm", "nickname", "name"];

export default async function signupAction(
	_prev: SignupState,
	formData: FormData
): Promise<SignupState> {
	const get = (k: string) => String(formData.get(k) ?? "");
	const email = get("email").trim();
	const nickname = get("nickname").trim();
	const name = get("name").trim();
	const password = get("password");
	const passwordConfirm = get("passwordConfirm");
	const next = safeNext(formData.get("next"));
	const values = { email, nickname, name };
	const fail = (
		errors: Partial<Record<Field, string>>,
		message = ""
	): SignupState => ({ status: "error", values, errors, message });

	// 화면에서 이미 검사하지만, 요청은 조작될 수 있어서 서버에서도 한 번 더 검사해요.
	const input: Record<Field, string> = {
		email,
		password,
		passwordConfirm,
		nickname,
		name
	};
	const errors: Partial<Record<Field, string>> = {};
	for (const f of FIELDS) {
		const msg = validateField(f, input[f], password);
		if (msg) errors[f] = msg;
	}
	if (Object.keys(errors).length > 0) return fail(errors);

	let status: number;
	let code = "";
	let serverMessage = "";
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/v1/users/signup`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password, nickname, name }),
			cache: "no-store"
		});
		status = res.status;
		if (!res.ok) {
			const data = await res.json().catch(() => ({}));
			code = data.code ?? "";
			serverMessage = data.message ?? "";
		}
	} catch {
		return fail({}, "가입하지 못했어요. 잠시 뒤에 다시 시도해 주세요.");
	}

	if (status === 409 && code === "DUPLICATE_EMAIL") {
		return fail({ email: "이미 사용 중인 이메일이에요." });
	}
	if (status === 409 && code === "DUPLICATE_NICKNAME") {
		return fail({ nickname: "이미 사용 중인 닉네임이에요." });
	}
	if (status !== 201 && status !== 200) {
		return fail(
			{},
			status === 400 && serverMessage ?
				serverMessage
			:	"가입하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
		);
	}

	// 가입이 끝나면 바로 로그인해 줘요. 로그인이 실패해도 가입은 됐으니 로그인 화면으로 보내요.
	const session = await startSession(email, password);
	revalidatePath("/", "layout");
	if (session !== "ok") redirect("/login");
	redirect(next);
}
