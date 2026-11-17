import type { Metadata } from "next";
import { pretendard } from "./fonts";
import "./globals.css";
import SiteHeader from "./SiteHeader";
import ThemeToggle from "./ThemeToggle";

export const metadata: Metadata = {
	title: { default: "가치잇다", template: "%s | 가치잇다" },
	description: "물건을 경매하고, 낙찰금은 기부로 이어지는 가치잇다"
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
				<SiteHeader />
				{children}
				<ThemeToggle />
			</body>
		</html>
	);
}
