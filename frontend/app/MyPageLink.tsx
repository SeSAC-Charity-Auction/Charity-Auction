import Link from "next/link";
import { connection } from "next/server";
import getMyProfile from "./donations/getMyProfile";
import styles from "./SiteHeader.module.css";

// 프로필 사진이 있으면 사진으로, 없거나 로그인하지 않았으면 '마이페이지' 글자로 보여줘요.
export default async function MyPageLink({ current }: { current: boolean }) {
	// 사람마다 다른 값이라 요청이 올 때 그려요.
	await connection();

	let image: string | null = null;
	try {
		image = (await getMyProfile())?.userImage ?? null;
	} catch {
		// 내 정보를 못 불러와도 메뉴는 글자로 보여줘요.
	}

	if (!image) {
		return (
			<Link
				href="/mypage"
				className={styles.link}
				aria-current={current ? "page" : undefined}
			>
				마이페이지
			</Link>
		);
	}

	return (
		<Link
			href="/mypage"
			className={`${styles.avatar} ${current ? styles.avatarOn : ""}`}
			aria-label="마이페이지"
			aria-current={current ? "page" : undefined}
		>
			{/* 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={image} alt="" className={styles.avatarImg} />
		</Link>
	);
}
