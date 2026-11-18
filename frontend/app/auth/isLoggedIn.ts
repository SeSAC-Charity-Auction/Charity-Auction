import { cookies } from "next/headers";
import { ACCESS_COOKIE } from "./authCookies";

// 로그인 쿠키가 있는지로 로그인 여부를 판단해요. (위쪽 메뉴의 로그인·로그아웃 버튼과 같은 기준이에요)
// 개발용 DEV_USER_ID가 있어도 로그인하지 않은 화면은 로그아웃 상태로 봐요.
export default async function isLoggedIn(): Promise<boolean> {
	return Boolean((await cookies()).get(ACCESS_COOKIE)?.value);
}
