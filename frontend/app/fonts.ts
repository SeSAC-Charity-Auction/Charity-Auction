// app/fonts.ts
// 사이트 전체가 쓰는 글꼴(Pretendard)이에요. 파일은 app/Pretendard.woff2예요.
import localFont from "next/font/local";

export const pretendard = localFont({
	src: "./Pretendard.woff2",
	weight: "45 920", // 가변 글꼴이라 굵기를 자유롭게 쓸 수 있어요
	display: "swap",
	variable: "--font-pretendard"
});
