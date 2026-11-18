import { cookies } from "next/headers";
import { connection } from "next/server";
import { ACCESS_COOKIE } from "./auth/authCookies";
import getMyProfile from "./donations/getMyProfile";
import MyPageNav from "./MyPageNav";

// 내 프로필 사진과 새 포인트 여부를 가져와서 마이페이지 메뉴에 넘겨줘요.
// 로그인하지 않았으면 메뉴 자체를 보여주지 않아요. (사진이 없으면 글자로 보여줘요)
export default async function MyPageLink() {
	// 사람마다 다른 값이라 요청이 올 때 그려요.
	await connection();
	// 위쪽의 로그인·로그아웃 버튼과 같은 기준(로그인 쿠키)으로 판단해요.
	// (개발용 DEV_USER_ID가 있어도, 로그인하지 않은 화면에는 마이페이지를 보여주지 않아요)
	if (!(await cookies()).get(ACCESS_COOKIE)?.value) return null;
	let image: string | null = null;
	let hasNew = false;
	let loggedIn = false;
	let failed = false; // 내 정보를 못 불러온 경우: 로그인 여부를 알 수 없어서 글자 메뉴는 남겨 둬요
	try {
		const profile = await getMyProfile();
		if (profile) {
			loggedIn = true;
			image = profile.userImage;
			hasNew = profile.hasNewPoints;
		}
	} catch {
		// 내 정보를 못 불러와도 메뉴는 글자로 보여줘요.
		failed = true;
	}
	if (!loggedIn && !failed) return null;
	return <MyPageNav image={image} hasNew={hasNew} watch={loggedIn} />;
}
