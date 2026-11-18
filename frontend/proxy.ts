import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { ACCESS_COOKIE } from "./app/auth/authCookies";

// 마이페이지(/mypage와 그 아래 모든 주소)는 로그인한 사람만 들어갈 수 있어요.
// 로그인 쿠키가 없으면 화면을 그리기 전에 로그인 페이지로 보내고, 로그인하면 원래 가려던 주소로 돌아와요.
export function proxy(request: NextRequest) {
	if (request.cookies.get(ACCESS_COOKIE)?.value) return NextResponse.next();
	const login = new URL("/login", request.url);
	const { pathname, search } = request.nextUrl;
	login.searchParams.set("next", pathname + search);
	return NextResponse.redirect(login);
}

export const config = {
	matcher: ["/mypage", "/mypage/:path*"]
};
