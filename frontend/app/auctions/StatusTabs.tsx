"use client";

// 전체·진행 중·예정·마감 탭이에요. 아래의 굵은 줄(보더)이 눌린 탭으로 ease-out으로 미끄러져 가요.
//  - 줄은 자바스크립트가 준비된 뒤에만 따로 그려요. 그 전에는 선택된 탭이 자기 밑줄을 그대로 가져서 모양이 같아요.
//  - 눌렀을 때 서버 응답을 기다리지 않고 줄이 먼저 움직여요.

import Link from "next/link";
import { useState } from "react";
import AuctionFilters from "./AuctionFilters";
import buildHref from "./buildHref";
import { STATUS_TABS } from "./constants";
import styles from "./page.module.css";
import useSlidingMarker from "./useSlidingMarker";

export default function StatusTabs({ filters }: { filters: AuctionFilters }) {
	// 방금 눌렀지만 주소가 아직 안 바뀐 탭이에요. 주소가 바뀌면(뒤로 가기 포함) 비워요.
	const [clicked, setClicked] = useState<string | null>(null);
	const [seen, setSeen] = useState(filters.status);
	if (seen !== filters.status) {
		setSeen(filters.status);
		setClicked(null);
	}
	const active = clicked ?? filters.status;

	const { navRef, markerRef } = useSlidingMarker(active);

	return (
		<nav
			ref={navRef}
			aria-label="경매 상태"
			className={styles.tabs}
		>
			{STATUS_TABS.map((t) => (
				<Link
					key={t.value}
					href={buildHref(filters, { status: t.value })}
					className={`${styles.tab} ${active === t.value ? styles.tabOn : ""}`}
					aria-current={active === t.value ? "true" : undefined}
					onClick={() => setClicked(t.value)}
				>
					{t.label}
				</Link>
			))}
			<span ref={markerRef} className={styles.tabBar} aria-hidden="true" />
		</nav>
	);
}
