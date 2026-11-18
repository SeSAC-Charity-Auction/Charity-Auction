import { cookies } from "next/headers";
import {
	ACCESS_COOKIE,
	BACKEND_REFRESH_COOKIE,
	REFRESH_COOKIE,
	cookieOptions
} from "./authCookies";

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
		const maxAgeAttr = attrs.find((a) =>
			a.toLowerCase().startsWith("max-age=")
		);
		const maxAge = Number(maxAgeAttr?.split("=")[1]);
		return {
			value,
			maxAge: Number.isFinite(maxAge) ? maxAge : 60 * 60 * 24 * 14
		};
	}
	return null;
}

// 이메일과 비밀번호로 로그인하고, 성공하면 로그인 쿠키를 저장해요. (로그인과 회원가입이 함께 써요)
export default async function startSession(
	email: string,
	password: string
): Promise<"ok" | "LOGIN_FAILED" | "UNKNOWN"> {
	let token: TokenResponse;
	let refresh: { value: string; maxAge: number } | null;
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auth/login`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ email, password }),
			cache: "no-store"
		});
		if (res.status === 401) return "LOGIN_FAILED";
		if (!res.ok) return "UNKNOWN";
		token = await res.json();
		refresh = readRefreshCookie(res);
	} catch {
		return "UNKNOWN";
	}
	const store = await cookies();
	store.set(ACCESS_COOKIE, token.accessToken, cookieOptions(token.expiresIn));
	if (refresh) {
		store.set(REFRESH_COOKIE, refresh.value, cookieOptions(refresh.maxAge));
	}
	return "ok";
}
