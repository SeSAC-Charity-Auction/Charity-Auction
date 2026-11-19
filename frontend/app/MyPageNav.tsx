"use client";

// 마이페이지 메뉴예요. 프로필 사진(image)이 있으면 사진으로, 없으면 글자로 보여줘요.
// hasNew가 true이면 새로 지급된 포인트가 있다는 뜻으로 붉은 점을 붙여요.
// offerCount가 1 이상이면 선택을 기다리는 낙찰 기회가 있다는 뜻으로 숫자 배지를 붙이고,
// 누르면 낙찰 기회 페이지로 바로 가요. 새 기회가 생기면 화면 아래에 알림도 띄워요.

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import currentMenu from "./currentMenu";
import useStompTopic from "./realtime/useStompTopic";
import styles from "./SiteHeader.module.css";

const REFRESH_MS = 30_000; // 새 포인트가 들어왔는지 이 간격으로 다시 확인해요
const TOAST_MS = 10_000; // 새 낙찰 기회 알림을 보여주는 시간
const OFFERS_PATH = "/mypage/offers";

export default function MyPageNav({
	image,
	hasNew = false,
	offerCount = 0,
	watch = false
}: {
	image: string | null;
	hasNew?: boolean;
	offerCount?: number; // 선택을 기다리는 낙찰 기회 수
	watch?: boolean; // 로그인한 사람이면 true: 새 포인트·낙찰 기회를 확인해요
}) {
	const router = useRouter();
	const pathname = usePathname();
	const current = currentMenu(pathname) === "mypage";
	const onOffersPage = pathname === OFFERS_PATH;

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

	// 낙찰 기회가 생기거나 넘어가거나 끝나면 백엔드가 /topic/offers 로 신호를 보내요.
	// 신호에는 누구 것인지 없어서, 받으면 화면을 새로 그려 "내 낙찰 기회"를 서버에 다시 물어봐요.
	// (여러 신호가 몰려와도 한 번만 새로 그려요)
	const pending = useRef<number | null>(null);
	const refreshSoon = useCallback(() => {
		if (pending.current !== null) return;
		pending.current = window.setTimeout(() => {
			pending.current = null;
			router.refresh();
		}, 500);
	}, [router]);
	useEffect(
		() => () => {
			if (pending.current !== null) window.clearTimeout(pending.current);
		},
		[]
	);
	useStompTopic(watch ? "/topic/offers" : null, refreshSoon);

	// 새 낙찰 기회 알림: 이미 본 개수(seen)보다 늘어나면 띄워요.
	// 처음 화면에 들어왔을 때 있던 기회는 배지로만 알리고 알림은 띄우지 않아요.
	const [seen, setSeen] = useState(offerCount);
	// 수락·포기로 줄었거나, 이미 낙찰 기회 페이지를 보고 있으면 본 것으로 쳐요. (그리는 중에 값을 맞춰요)
	if (offerCount < seen || (onOffersPage && offerCount !== seen)) {
		setSeen(offerCount);
	}
	const showToast = watch && !onOffersPage && offerCount > seen;
	useEffect(() => {
		if (!showToast) return;
		const id = window.setTimeout(() => setSeen(offerCount), TOAST_MS);
		return () => window.clearTimeout(id);
	}, [showToast, offerCount]);

	const hasOffers = offerCount > 0;
	const href = hasOffers ? OFFERS_PATH : "/mypage";
	const label =
		hasOffers ? `마이페이지, 선택을 기다리는 낙찰 기회 ${offerCount}건`
		: hasNew ? "마이페이지, 새 포인트가 지급됐어요"
		: "마이페이지";
	// 낙찰 기회는 기한이 있어서 포인트 점보다 먼저 보여줘요.
	const mark =
		hasOffers ?
			<span className={styles.count} aria-hidden="true">
				{offerCount > 9 ? "9+" : offerCount}
			</span>
		: hasNew ? <span className={styles.dot} aria-hidden="true" />
		: null;

	const toast =
		showToast ?
			<div className={styles.toast} role="status">
				<p className={styles.toastText}>
					<strong>낙찰 기회가 왔어요!</strong> 기한 안에 수락하거나 포기해 주세요.
				</p>
				<Link
					href={OFFERS_PATH}
					className={styles.toastLink}
					onClick={() => setSeen(offerCount)}
				>
					지금 선택하기
				</Link>
				<button
					type="button"
					className={styles.toastClose}
					onClick={() => setSeen(offerCount)}
					aria-label="알림 닫기"
				>
					×
				</button>
			</div>
		:	null;

	if (!image) {
		return (
			<>
				<Link
					href={href}
					className={`${styles.link} ${styles.hasDot}`}
					aria-label={hasOffers || hasNew ? label : undefined}
					aria-current={current ? "page" : undefined}
				>
					마이페이지
					{mark}
				</Link>
				{toast}
			</>
		);
	}
	return (
		<>
			<Link
				href={href}
				className={`${styles.avatar} ${current ? styles.avatarOn : ""}`}
				aria-label={label}
				aria-current={current ? "page" : undefined}
			>
				{/* 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요. */}
				{/* eslint-disable-next-line @next/next/no-img-element */}
				<img src={image} alt="" className={styles.avatarImg} />
				{mark}
			</Link>
			{toast}
		</>
	);
}
