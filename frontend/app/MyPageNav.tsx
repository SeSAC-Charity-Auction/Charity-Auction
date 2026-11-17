"use client";

// 마이페이지 메뉴예요. 프로필 사진(image)이 있으면 사진으로, 없으면 글자로 보여줘요.
// hasNew가 true이면 새로 지급된 포인트가 있다는 뜻으로 붉은 점을 붙여요.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import currentMenu from "./currentMenu";
import styles from "./SiteHeader.module.css";

const REFRESH_MS = 30_000; // 새 포인트가 들어왔는지 이 간격으로 다시 확인해요

export default function MyPageNav({
	image,
	hasNew = false,
	watch = false
}: {
	image: string | null;
	hasNew?: boolean;
	watch?: boolean; // 로그인한 사람이면 true: 일정 간격으로 새 포인트를 확인해요
}) {
	const router = useRouter();
	const current = currentMenu(usePathname()) === "mypage";

	// 포인트는 서버에서 지급되고 위쪽 메뉴는 페이지를 옮겨도 그대로라서,
	// 화면이 보이는 동안에는 주기적으로 서버에서 다시 받아와요. (보고 있던 화면의 입력값은 그대로 남아요)
	useEffect(() => {
		if (!watch) return;
		const refresh = () => {
			if (document.visibilityState === "visible") router.refresh();
		};
		const timer = setInterval(refresh, REFRESH_MS);
		document.addEventListener("visibilitychange", refresh);
		return () => {
			clearInterval(timer);
			document.removeEventListener("visibilitychange", refresh);
		};
	}, [watch, router]);

	const label = hasNew ? "마이페이지, 새 포인트가 지급됐어요" : "마이페이지";
	const dot =
		hasNew ?
			<span className={styles.dot} aria-hidden="true" />
		:	null;

	if (!image) {
		return (
			<Link
				href="/mypage"
				className={`${styles.link} ${styles.hasDot}`}
				aria-label={hasNew ? label : undefined}
				aria-current={current ? "page" : undefined}
			>
				마이페이지
				{dot}
			</Link>
		);
	}

	return (
		<Link
			href="/mypage"
			className={`${styles.avatar} ${current ? styles.avatarOn : ""}`}
			aria-label={label}
			aria-current={current ? "page" : undefined}
		>
			{/* 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요. */}
			{/* eslint-disable-next-line @next/next/no-img-element */}
			<img src={image} alt="" className={styles.avatarImg} />
			{dot}
		</Link>
	);
}
