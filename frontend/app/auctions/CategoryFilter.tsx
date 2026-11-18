"use client";

// 카테고리 칩이에요. 선택된 칩의 까만 바탕이 눌린 칩으로 ease-out으로 미끄러져 가요.
// (눌렀을 때 서버 응답을 기다리지 않고 먼저 움직여요)

import Link from "next/link";
import { useState } from "react";
import AuctionFilters from "./AuctionFilters";
import buildHref from "./buildHref";
import Category from "./Category";
import styles from "./page.module.css";
import useSlidingMarker from "./useSlidingMarker";

export default function CategoryFilter({
	categories,
	filters
}: {
	categories: Category[];
	filters: AuctionFilters;
}) {
	// 방금 눌렀지만 주소가 아직 안 바뀐 칩이에요. 주소가 바뀌면(뒤로 가기 포함) 비워요. ("all"은 전체)
	const [clicked, setClicked] = useState<number | null | undefined>(
		undefined
	);
	const [seen, setSeen] = useState(filters.categoryId);
	if (seen !== filters.categoryId) {
		setSeen(filters.categoryId);
		setClicked(undefined);
	}
	const active = clicked === undefined ? filters.categoryId : clicked;
	const { navRef, markerRef } = useSlidingMarker(String(active), true);
	const items: { id: number | null; name: string }[] = [
		{ id: null, name: "전체" },
		...categories.map((c) => ({ id: c.categoryId, name: c.categoryName }))
	];
	return (
		<nav ref={navRef} aria-label="카테고리" className={styles.chips}>
			{items.map((c) => (
				<Link
					key={c.id ?? "all"}
					href={buildHref(filters, { categoryId: c.id })}
					className={`${styles.chip} ${active === c.id ? styles.chipOn : ""}`}
					aria-current={active === c.id ? "true" : undefined}
					onClick={() => setClicked(c.id)}
				>
					{c.name}
				</Link>
			))}
			<span ref={markerRef} className={styles.chipBar} aria-hidden="true" />
		</nav>
	);
}
