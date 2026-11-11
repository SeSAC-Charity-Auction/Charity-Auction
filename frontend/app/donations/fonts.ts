// app/donations/fonts.ts
// 상세 페이지와 기부 폼이 같이 쓰는 글꼴이에요.
// (폰트는 빌드할 때 구글 폰트에서 내려받으므로 인터넷 연결이 필요해요.)
import { Black_Han_Sans, Noto_Sans_KR } from "next/font/google";

// 제목과 숫자는 굵은 포스터 느낌의 글꼴, 본문은 읽기 편한 글꼴이에요.
export const display = Black_Han_Sans({ weight: "400", preload: false, display: "swap" });
export const body = Noto_Sans_KR({
  weight: ["400", "500", "700"],
  preload: false,
  display: "swap",
});
