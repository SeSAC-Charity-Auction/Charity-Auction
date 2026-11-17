export type Menu = "auctions" | "donations" | "mypage";

// 주소(pathname)를 보고 지금 어느 메뉴를 보고 있는지 알려줘요.
export default function currentMenu(pathname: string): Menu | null {
	if (pathname === "/" || pathname.startsWith("/auctions")) return "auctions";
	if (pathname.startsWith("/donations")) return "donations";
	if (pathname.startsWith("/mypage")) return "mypage";
	return null;
}
