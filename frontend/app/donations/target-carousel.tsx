"use client";

import {
	useCallback,
	useEffect,
	useLayoutEffect,
	useRef,
	useState,
	type ReactNode
} from "react";
import styles from "./page.module.css";

export type CarouselItem = { key: string; node: ReactNode };

// 기부처 카드 한 세트를 앞뒤로 여러 번 이어 붙여 두고,
// 스크롤이 멈추면 한 세트 길이만큼 조용히 되돌려서 끝없이 도는 것처럼 보이게 합니다.
export default function TargetCarousel({ items }: { items: CarouselItem[] }) {
	const count = items.length;
	const loop = count > 1;
	const ref = useRef<HTMLDivElement>(null);
	const [copies, setCopies] = useState(3);
	const copiesRef = useRef(3);
	const period = useRef(0); // 카드 한 세트의 가로 길이(간격 포함)
	const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

	const measure = useCallback(() => {
		const el = ref.current;
		if (!el || !loop || el.children.length <= count) return;
		const first = el.children[0] as HTMLElement;
		const next = el.children[count] as HTMLElement;
		const s = next.offsetLeft - first.offsetLeft;
		if (s <= 0) return;
		period.current = s;
		// 화면을 가득 채우고도 양쪽에 여유가 남도록 세트 수를 정해요.
		const want = 2 * Math.ceil(el.clientWidth / s) + 1;
		if (want !== copiesRef.current) {
			copiesRef.current = want;
			setCopies(want);
		}
	}, [count, loop]);

	// 세트 수가 정해지면 가운데 세트의 첫 카드에서 시작해요.
	useLayoutEffect(() => {
		const el = ref.current;
		if (!el || !loop) return;
		measure();
		el.scrollLeft = ((copies - 1) / 2) * period.current;
	}, [copies, loop, measure]);

	useLayoutEffect(() => {
		ref.current
			?.querySelectorAll<HTMLElement>("[data-clone] a, [data-clone] button")
			.forEach((n) => n.setAttribute("tabindex", "-1"));
	}, [copies, items]);

	useEffect(() => {
		const el = ref.current;
		if (!el || !loop) return;
		const ro = new ResizeObserver(measure);
		ro.observe(el);
		return () => ro.disconnect();
	}, [loop, measure]);

	useEffect(() => () => clearTimeout(timer.current), []);

	function normalize() {
		const el = ref.current;
		const s = period.current;
		if (!el || s <= 0) return;
		const base = ((copiesRef.current - 1) / 2) * s;
		const rel = el.scrollLeft - base;
		const wrapped = ((rel % s) + s) % s;
		if (Math.abs(rel - wrapped) > 0.5) el.scrollLeft = base + wrapped;
	}

	function onScroll() {
		const el = ref.current;
		if (!el || !loop) return;
		clearTimeout(timer.current);
		// 끝에 거의 닿았으면 바로, 아니면 스크롤이 멈춘 뒤에 되돌려요.
		const atEdge =
			el.scrollLeft <= 1 ||
			el.scrollLeft >= el.scrollWidth - el.clientWidth - 1;
		if (atEdge) normalize();
		else timer.current = setTimeout(normalize, 120);
	}

	function move(dir: 1 | -1) {
		const el = ref.current;
		if (!el) return;
		const edge = parseFloat(getComputedStyle(el).paddingLeft) || 0;
		const slides = Array.from(el.children) as HTMLElement[];
		const left = el.scrollLeft;
		const target =
			dir === 1 ?
				slides.find((s) => s.offsetLeft - edge > left + 2)
			:	[...slides].reverse().find((s) => s.offsetLeft - edge < left - 2);
		if (!target) return;
		const reduce = window.matchMedia(
			"(prefers-reduced-motion: reduce)"
		).matches;
		el.scrollTo({
			left: target.offsetLeft - edge,
			behavior: reduce ? "auto" : "smooth"
		});
	}

	const total = loop ? copies : 1;
	const mid = loop ? (copies - 1) / 2 : 0;

	return (
		<div className={styles.carousel}>
			<div
				ref={ref}
				className={styles.targetScroller}
				tabIndex={0}
				role="region"
				aria-label="기부처 목록"
				onScroll={onScroll}
				onKeyDown={(e) => {
					if (!loop) return;
					if (e.key === "ArrowRight") {
						e.preventDefault();
						move(1);
					} else if (e.key === "ArrowLeft") {
						e.preventDefault();
						move(-1);
					}
				}}
			>
				{Array.from({ length: total }, (_, c) =>
					items.map((item) => (
						<div
							key={`${c}-${item.key}`}
							className={styles.slide}
							// 가운데 세트가 원본이에요. 복제본은 눈에만 보이고 클릭은 되지만, 보조기기와 Tab 이동에서는 제외해요.
							aria-hidden={c === mid ? undefined : true}
							data-clone={c === mid ? undefined : ""}
						>
							{item.node}
						</div>
					))
				)}
			</div>

			{loop && (
				<>
					<button
						type="button"
						className={`${styles.arrow} ${styles.arrowPrev}`}
						onClick={() => move(-1)}
						aria-label="이전 기부처"
					>
						<span aria-hidden="true">←</span>
					</button>
					<button
						type="button"
						className={`${styles.arrow} ${styles.arrowNext}`}
						onClick={() => move(1)}
						aria-label="다음 기부처"
					>
						<span aria-hidden="true">→</span>
					</button>
				</>
			)}
		</div>
	);
}
