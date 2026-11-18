"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
	ACCESS_COOKIE,
	BACKEND_REFRESH_COOKIE,
	REFRESH_COOKIE,
	cookieOptions
} from "../auth/authCookies";
import LoginState from "./LoginState";
import safeNext from "./safeNext";

const MESSAGES = {
	EMPTY: "이메일과 비밀번호를 모두 입력해 주세요.",
	LOGIN_FAILED: "이메일 또는 비밀번호가 올바르지 않아요.",
	UNKNOWN: "로그인하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

type TokenResponse = {
	tokenType: string;
	accessToken: string;
	expiresIn: number;
};

function readRefreshCookie(
	res: Response
): { value: string; maxAge: number } | null {
	for (const line of res.headers.getSetCookie()) {
		const [pair, ...attrs] = line.split(";").map((s) => s.trim());
		const eq = pair.indexOf("=");
		if (pair.slice(0, eq) !== BACKEND_REFRESH_COOKIE) continue;
		const value = pair.slice(eq + 1);
		if (!value) return null;
		const maxAgeAttr = attrs.find((a) => a.toLowerCase().startsWith("max-age="));
		const maxAge = Number(maxAgeAttr?.split("=")[1]);
		return { value, maxAge: Number.isFinite(maxAge) ? maxAge : 60 * 60 * 24 * 14 };
	}
	return null;
}

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

	let token: TokenResponse;
	let refresh: { value: string; maxAge: number } | null;
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
			cache: "no-store"
		});
		if (res.status === 401) {
			return { status: "error", email, message: MESSAGES.LOGIN_FAILED };
		}
		if (!res.ok) {
			return { status: "error", email, message: MESSAGES.UNKNOWN };
		}
		token = await res.json();
		refresh = readRefreshCookie(res);
	} catch {
		return { status: "error", email, message: MESSAGES.UNKNOWN };
	}

	const store = await cookies();
	store.set(ACCESS_COOKIE, token.accessToken, cookieOptions(token.expiresIn));
	if (refresh) {
		store.set(REFRESH_COOKIE, refresh.value, cookieOptions(refresh.maxAge));
	}

	revalidatePath("/", "layout");
	redirect(next);
}
