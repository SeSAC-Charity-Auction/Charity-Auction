"use client";

// 화면에 보이기 시작하는 순간 data-play="true"를 붙여 주는 div예요. (한 번만)
// 진행 막대나 그래프의 "차오르는" 애니메이션은 페이지가 열릴 때가 아니라
// 이 값이 true가 된 뒤에 시작해요. (css에서 [data-play="true"] 아래에서만 움직여요)
// 자바스크립트가 없으면 움직임 없이 바로 완성된 모양을 보여줘요.

import { useEffect, useRef, useState } from "react";

export default function InView({
	children,
	...rest
}: React.HTMLAttributes<HTMLDivElement>) {
	const ref = useRef<HTMLDivElement>(null);
	const [seen, setSeen] = useState(false);

	useEffect(() => {
		const el = ref.current;
		if (!el) return;
		if (typeof IntersectionObserver === "undefined") {
			const id = window.setTimeout(() => setSeen(true), 0);
			return () => window.clearTimeout(id);
		}
		// 요소의 3할 이상이 화면 안으로 들어오면 시작해요. (아래쪽 가장자리는 조금 더 들어와야 해요)
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setSeen(true);
					io.disconnect();
				}
			},
			{ threshold: 0.3, rootMargin: "0px 0px -6% 0px" }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);

	return (
		<div ref={ref} data-play={seen ? "true" : "false"} {...rest}>
			{children}
		</div>
	);
}
