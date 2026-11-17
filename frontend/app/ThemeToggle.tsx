"use client";

import { useSyncExternalStore } from "react";
import subscribe from "./subscribe";

type Theme = "light" | "dark";

const STORAGE_KEY = "theme";

function getTheme(): Theme {
	return document.documentElement.dataset.theme === "dark" ? "dark" : "light";
}

export default function ThemeToggle() {
	// 서버에서는 모양을 알 수 없으니 light 로 두고, 클라이언트에서 실제 값으로 맞춰요.
	const theme = useSyncExternalStore(subscribe, getTheme, () => "light");
	const isDark = theme === "dark";
	function toggle() {
		const next: Theme = isDark ? "light" : "dark";
		document.documentElement.dataset.theme = next;
		try {
			localStorage.setItem(STORAGE_KEY, next);
		} catch {}
	}
	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
			title={isDark ? "라이트 모드로 전환" : "다크 모드로 전환"}
			suppressHydrationWarning
			className="fixed right-4 bottom-4 z-50 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border-[1.5px] border-(--mist-strong) bg-(--surface) text-(--ink) shadow-md transition-transform hover:scale-105 focus-visible:outline-3 focus-visible:outline-(--bid-fg)"
		>
			<svg
				width="20"
				height="20"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
				aria-hidden="true"
			>
				{isDark ?
					<>
						<circle cx="12" cy="12" r="4" />
						<path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
					</>
				:	<path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />}
			</svg>
		</button>
	);
}
