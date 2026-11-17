"use client";

// 마이페이지 메뉴예요. 프로필 사진(image)이 있으면 사진으로, 없으면 글자로 보여줘요.

import Link from "next/link";
import { usePathname } from "next/navigation";
import currentMenu from "./currentMenu";
import styles from "./SiteHeader.module.css";

export default function MyPageNav({ image }: { image: string | null }) {
	const current = currentMenu(usePathname()) === "mypage";

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
