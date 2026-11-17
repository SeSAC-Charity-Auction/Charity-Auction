"use client";

// 경매·기부 메뉴예요. 지금 보는 주소를 알아야 강조할 수 있어서 클라이언트 컴포넌트예요.

import Link from "next/link";
import { usePathname } from "next/navigation";
import currentMenu, { type Menu } from "./currentMenu";
import styles from "./SiteHeader.module.css";

const MENUS: { key: Menu; href: string; label: string }[] = [
	{ key: "auctions", href: "/", label: "경매" },
	{ key: "donations", href: "/donations", label: "기부" }
];

export default function NavMenu() {
	const current = currentMenu(usePathname());
	return (
		<>
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
		</>
	);
}
