"use client";

// app/donations/flip-text.tsx
// 글자 속의 숫자를 달력(전광판)이 넘어가듯 한 자리씩 "촤르륵" 넘겨서 보여주는 컴포넌트예요.
//  - 처음: 화면에 보이는 순간 한 바퀴(0~9) 돌고 원래 숫자에서 멈춰요.
//  - 값이 바뀔 때(예: 슬라이더): 예전 숫자에서 새 숫자까지 앞으로 넘어가요.
// 서버가 처음 그리는 HTML에는 이미 최종 숫자가 들어 있어서, 자바스크립트가 없어도 값이 보여요.
// (Math.random, Date.now를 쓰지 않아서 서버 렌더링과 결과가 같아요.)

import { useCallback, useEffect, useRef, useState } from "react";
import Flip from "./Flip";
import styles from "./flip-text.module.css";

const STEP_MS = 50; // 한 칸 넘어가는 시간 (css의 --flip-ms와 같아야 해요)
const STAGGER_MS = 20; // 자리마다 조금씩 늦게 시작해서 왼쪽부터 차례로 도는 느낌을 줘요
const FULL_ROUND = 10; // 0~9를 한 바퀴

const prefersReducedMotion = () =>
	window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function Tile({
	digit,
	spin,
	delay
}: {
	digit: number;
	spin: boolean; // true가 되면 한 바퀴 돌아요
	delay: number;
}) {
	const [flip, setFlip] = useState<Flip>({
		prev: digit,
		shown: digit,
		tick: 0
	});
	// 타이머 안에서 "지금 값"을 읽어야 해서 ref에도 들고 있어요.
	const shownRef = useRef(digit);
	const targetRef = useRef(digit);
	const spinsLeft = useRef(0);
	const timer = useRef<number | null>(null);
	const run = useCallback((startDelay: number) => {
		if (timer.current !== null) return; // 이미 돌고 있으면 그대로 이어가요
		const step = () => {
			const cur = shownRef.current;
			if (spinsLeft.current <= 0 && cur === targetRef.current) {
				timer.current = null;
				return;
			}
			const next = (cur + 1) % 10; // 전광판은 항상 앞으로만 넘어가요
			if (spinsLeft.current > 0) spinsLeft.current -= 1;
			shownRef.current = next;
			setFlip((f) => ({ prev: cur, shown: next, tick: f.tick + 1 }));
			timer.current = window.setTimeout(step, STEP_MS);
		};
		timer.current = window.setTimeout(step, startDelay);
	}, []);
	// 값이 바뀌면 새 숫자까지 넘겨요.
	useEffect(() => {
		targetRef.current = digit;
		if (shownRef.current === digit) return;
		if (prefersReducedMotion()) {
			// 움직임 없이 바로 새 숫자로 바꿔요. (타이머 콜백에서 바꿔서 effect 안에서 직접 setState하지 않아요)
			const id = window.setTimeout(() => {
				shownRef.current = digit;
				setFlip({ prev: digit, shown: digit, tick: 0 });
			}, 0);
			return () => window.clearTimeout(id);
		}
		run(0);
	}, [digit, run]);
	// 화면에 보이면 한 바퀴 돌아요.
	useEffect(() => {
		if (!spin || prefersReducedMotion()) return;
		spinsLeft.current = FULL_ROUND;
		run(delay);
		return () => {
			spinsLeft.current = 0;
		};
	}, [spin, delay, run]);
	// 화면에서 사라질 때 타이머를 정리해요.
	useEffect(() => {
		return () => {
			if (timer.current !== null) window.clearTimeout(timer.current);
			timer.current = null;
		};
	}, []);
	const { prev, shown, tick } = flip;
	return (
		<span className={styles.tile}>
			{/* 가만히 있는 위/아래 판: 위는 "새 숫자", 아래는 "예전 숫자" */}
			{/* 바탕이 없어서, 넘어가는 판과 겹쳐 보이지 않게 절반 시점에 교대로 보였다 사라져요 */}
			<span
				key={`st${tick}`}
				className={`${styles.half} ${styles.top} ${tick > 0 ? styles.staticTopNew : ""}`}
			>
				<span className={styles.glyph}>{shown}</span>
			</span>
			<span
				key={`sb${tick}`}
				className={`${styles.half} ${styles.bottom} ${tick > 0 ? styles.staticBottomOld : ""}`}
			>
				<span className={`${styles.glyph} ${styles.glyphBottom}`}>
					{tick > 0 ? prev : shown}
				</span>
			</span>
			{/* 넘어가는 판: key가 바뀔 때마다 애니메이션이 처음부터 다시 시작해요 */}
			{tick > 0 && (
				<>
					<span
						key={`t${tick}`}
						className={`${styles.half} ${styles.top} ${styles.flapTop}`}
					>
						<span className={styles.glyph}>{prev}</span>
					</span>
					<span
						key={`b${tick}`}
						className={`${styles.half} ${styles.bottom} ${styles.flapBottom}`}
					>
						<span
							className={`${styles.glyph} ${styles.glyphBottom}`}
						>
							{shown}
						</span>
					</span>
				</>
			)}
		</span>
	);
}

// "6,800,000" 같은 숫자 덩어리를 찾는 규칙이에요. (쉼표는 숫자 사이에 있을 때만)
const NUMBER = /(\d+(?:,\d{3})*)/;

export default function FlipText({ text }: { text: string }) {
	const rootRef = useRef<HTMLSpanElement>(null);
	const [spin, setSpin] = useState(false);
	// 화면에 보이기 시작하면 한 번만 돌려요. (스크롤해서 아래쪽 숫자가 보일 때 돌아요)
	useEffect(() => {
		const el = rootRef.current;
		if (!el) return;
		if (typeof IntersectionObserver === "undefined") {
			const id = window.setTimeout(() => setSpin(true), 0);
			return () => window.clearTimeout(id);
		}
		const io = new IntersectionObserver(
			(entries) => {
				if (entries.some((e) => e.isIntersecting)) {
					setSpin(true);
					io.disconnect();
				}
			},
			{ threshold: 0.3 }
		);
		io.observe(el);
		return () => io.disconnect();
	}, []);
	let digitIndex = 0; // 글 전체에서 몇 번째 숫자인지 (돌기 시작하는 시간차에 써요)
	return (
		<span ref={rootRef} className={styles.root}>
			<span className={styles.sr}>{text}</span>
			<span aria-hidden="true">
				{text.split(NUMBER).map((part, i) => {
					if (i % 2 === 0) return part; // 숫자가 아닌 글자는 그대로 (줄바꿈도 자연스럽게)
					return (
						<span key={i}>
							{part.split("").map((ch, j) => {
								if (ch === ",") {
									return (
										<span key={j} className={styles.comma}>
											,
										</span>
									);
								}
								const delay =
									Math.min(digitIndex++, 12) * STAGGER_MS;
								return (
									<Tile
										key={j}
										digit={Number(ch)}
										spin={spin}
										delay={delay}
									/>
								);
							})}
						</span>
					);
				})}
			</span>
		</span>
	);
}
