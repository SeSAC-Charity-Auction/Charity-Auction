import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";
import SiteHeader from "./SiteHeader";
import ThemeToggle from "./ThemeToggle";

export const metadata: Metadata = {
	title: { default: "가치잇다", template: "%s | 가치잇다" },
	description: "물건을 경매하고, 낙찰금은 기부로 이어지는 가치잇다",
	applicationName: "가치잇다",
	openGraph: {
		siteName: "가치잇다",
		locale: "ko_KR",
		type: "website"
	}
};

// 첫 화면이 번쩍이지 않도록, 페이지가 그려지기 전에 저장된 테마(없으면 시스템 설정)를 적용해요.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.dataset.theme=t}catch(e){}})()`;

export default function RootLayout({ children }: LayoutProps<"/">) {
	return (
		<html
			lang="ko"
			className={`${pretendard.variable} h-full antialiased`}
			suppressHydrationWarning
		>
			<head>
				<script dangerouslySetInnerHTML={{ __html: themeScript }} />
			</head>
			<body className="min-h-full flex flex-col">
				{/* 키보드·스크린리더 사용자가 반복되는 위쪽 메뉴를 건너뛰고 본문으로 바로 갈 수 있어요. 평소엔 숨어 있다가 Tab으로 포커스를 받으면 보여요. */}
				<a
					href="#main-content"
					className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-lg focus:bg-(--surface) focus:px-4 focus:py-3 focus:font-bold focus:text-(--ink) focus:outline-3 focus:outline-(--bid-fg)"
				>
					본문 바로가기
				</a>
				<SiteHeader />
				{children}
				<ThemeToggle />
			</body>
		</html>
	);
}
