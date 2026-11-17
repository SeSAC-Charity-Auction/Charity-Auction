import { connection } from "next/server";
import getMyProfile from "./donations/getMyProfile";
import MyPageNav from "./MyPageNav";

// 내 프로필 사진과 새 포인트 여부를 가져와서 마이페이지 메뉴에 넘겨줘요.
// (로그인하지 않았거나 사진이 없으면 글자로 보여줘요)
export default async function MyPageLink() {
	// 사람마다 다른 값이라 요청이 올 때 그려요.
	await connection();

	let image: string | null = null;
	let hasNew = false;
	let loggedIn = false;
	try {
		const profile = await getMyProfile();
		if (profile) {
			loggedIn = true;
			image = profile.userImage;
			hasNew = profile.hasNewPoints;
		}
	} catch {
		// 내 정보를 못 불러와도 메뉴는 글자로 보여줘요.
	}
	return <MyPageNav image={image} hasNew={hasNew} watch={loggedIn} />;
}
