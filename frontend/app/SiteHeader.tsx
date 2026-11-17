import Link from "next/link";
import styles from "./SiteHeader.module.css";

type Current = "auctions" | "donations" | "mypage";

const MENUS: { key: Current; href: string; label: string }[] = [
	{ key: "auctions", href: "/", label: "경매" },
	{ key: "donations", href: "/donations", label: "기부" },
	{ key: "mypage", href: "/mypage", label: "마이페이지" }
];

// 모든 페이지 위쪽에 들어가는 메뉴예요. current는 지금 보고 있는 메뉴(강조 표시)예요.
export default function SiteHeader({ current }: { current: Current }) {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					가치잇다
				</Link>
				<nav aria-label="주요 메뉴" className={styles.nav}>
					{MENUS.map((m) => (
						<Link
							key={m.key}
							href={m.href}
							className={styles.link}
							aria-current={m.key === current ? "page" : undefined}
						>
							{m.label}
						</Link>
					))}
				</nav>
			</div>
		</header>
	);
}
