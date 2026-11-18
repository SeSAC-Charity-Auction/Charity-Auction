"use client";

// 같은 페이지 안의 위치(#id)로 이동하는 링크예요. 누르면 ease-out으로 스크롤해요.
//  - 처음엔 빠르게 움직이다가 도착할 때 부드럽게 느려져요.
//  - 움직임을 줄이는 설정이면 바로 이동하고, 자바스크립트가 없으면 일반 #링크로 동작해요.
//  - 도착하면 그 구역으로 포커스를 옮겨서 키보드·스크린리더 사용자도 같은 곳에서 이어갈 수 있어요.

import type { ComponentProps } from "react";

const DURATION_MS = 700;
const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

export default function SmoothScrollLink({
	href,
	onClick,
	...rest
}: ComponentProps<"a"> & { href: `#${string}` }) {
	return (
		<a
			href={href}
			{...rest}
			onClick={(e) => {
				onClick?.(e);
				if (e.defaultPrevented) return;
				const target = document.getElementById(href.slice(1));
				if (!target) return;
				e.preventDefault();
				history.pushState(null, "", href);
				const reduce = window.matchMedia(
					"(prefers-reduced-motion: reduce)"
				).matches;
				const margin =
					parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
				const from = window.scrollY;
				const max =
					document.documentElement.scrollHeight - window.innerHeight;
				const to = Math.min(
					max,
					Math.max(
						0,
						target.getBoundingClientRect().top + from - margin
					)
				);
				const finish = () => {
					window.scrollTo(0, to);
					target.focus({ preventScroll: true });
				};
				if (reduce || Math.abs(to - from) < 2) return finish();
				const start = performance.now();
				const step = (now: number) => {
					const t = Math.min(1, (now - start) / DURATION_MS);
					window.scrollTo(0, from + (to - from) * easeOutCubic(t));
					if (t < 1) requestAnimationFrame(step);
					else finish();
				};
				requestAnimationFrame(step);
			}}
		/>
	);
}
