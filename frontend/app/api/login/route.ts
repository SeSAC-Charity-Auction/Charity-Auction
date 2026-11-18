import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import startSession from "../../auth/startSession";
import safeNext from "../../login/safeNext";

// 로그인 폼이 일반 폼 전송(POST)으로 보내는 곳이에요.
// 서버 액션 대신 진짜 폼 전송과 페이지 이동을 써야 브라우저의 비밀번호 관리자가
// 로그인 성공을 알아보고 계정을 저장해 주고, 다음에 자동으로 채워 줘요.
// 처리가 끝나면 항상 303으로 돌려보내서, 새로고침해도 다시 전송되지 않아요.
export async function POST(request: Request) {
	const form = await request.formData();
	const email = String(form.get("email") ?? "").trim();
	const password = String(form.get("password") ?? "");
	const next = safeNext(form.get("next"));

	const back = (error: string) => {
		const url = new URL("/login", request.url);
		url.searchParams.set("error", error);
		if (next !== "/") url.searchParams.set("next", next);
		return NextResponse.redirect(url, 303);
	};

	if (!email || !password) return back("EMPTY");
	const result = await startSession(email, password);
	if (result !== "ok") return back(result);

	revalidatePath("/", "layout");
	return NextResponse.redirect(new URL(next, request.url), 303);
}
