"use client";

// 선택된 항목(aria-current="true") 위치로 표시(marker)를 ease-out으로 미끄러뜨리는 도우미예요.
//  - nav에는 position: relative를, marker에는 position: absolute를 주세요.
//  - 처음 그릴 때와 창 크기가 바뀔 때는 움직임 없이 놓고, 선택이 바뀔 때만 미끄러져요.
//  - 준비가 끝나면 nav에 data-slide를 달아요. (CSS에서 항목 자신의 밑줄·배경을 지울 때 써요)
//  - box가 true면 높이와 세로 위치도 따라가요. (여러 줄로 감기는 칩용)

import { useLayoutEffect, useRef } from "react";

export default function useSlidingMarker(active: string, box = false) {
	const navRef = useRef<HTMLElement>(null);
	const markerRef = useRef<HTMLSpanElement>(null);
	const ready = useRef(false);
	const last = useRef(""); // 마지막으로 놓은 위치. 같으면 다시 놓지 않아요

	const place = (animate: boolean) => {
		const nav = navRef.current;
		const marker = markerRef.current;
		const item = nav?.querySelector<HTMLElement>('[aria-current="true"]');
		if (!nav || !marker || !item) return;
		const target = `${item.offsetLeft},${item.offsetTop},${item.offsetWidth},${item.offsetHeight}`;
		// 목록 길이가 달라져 스크롤바가 생기거나 사라지면 크기 감시가 불리는데,
		// 위치가 그대로면 건드리지 않아요. (움직이던 애니메이션이 끊기지 않게)
		if (!animate && target === last.current) return;
		last.current = target;
		marker.style.transition = animate ? "" : "none";
		marker.style.width = `${item.offsetWidth}px`;
		if (box) marker.style.height = `${item.offsetHeight}px`;
		marker.style.transform = `translate(${item.offsetLeft}px, ${box ? item.offsetTop : 0}px)`;
		if (!animate) {
			void marker.offsetWidth; // 위치를 먼저 확정해서 첫 모습은 움직이지 않게 해요
			marker.style.transition = "";
		}
		nav.dataset.slide = "";
	};

	// 선택이 바뀔 때: 처음 한 번만 제자리에 놓고, 그다음부터는 미끄러져요.
	useLayoutEffect(() => {
		place(ready.current);
		ready.current = true;
	});

	// 크기가 바뀔 때만 움직임 없이 다시 맞춰요. (선택이 바뀔 때마다 새로 달면 시작하자마자 바로 불러져서 움직임이 끊겨요)
	useLayoutEffect(() => {
		const nav = navRef.current;
		if (!nav) return;
		const ro = new ResizeObserver(() => place(false));
		ro.observe(nav);
		return () => ro.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return { navRef, markerRef, active };
}
