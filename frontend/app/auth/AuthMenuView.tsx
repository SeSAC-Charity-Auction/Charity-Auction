"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import headerStyles from "../SiteHeader.module.css";
import styles from "./AuthMenu.module.css";
import logoutAction from "./logoutAction";

export default function AuthMenuView({ loggedIn }: { loggedIn: boolean }) {
	const pathname = usePathname();

	if (loggedIn) {
		return (
			<form action={logoutAction} className={styles.form}>
				<button
					type="submit"
					className={`${headerStyles.link} ${styles.button}`}
				>
					로그아웃
				</button>
			</form>
		);
	}

	const next =
		pathname === "/" || pathname === "/login" ?
			""
		:	`?next=${encodeURIComponent(pathname)}`;
	return (
		<Link
			href={`/login${next}`}
			className={headerStyles.link}
			aria-current={pathname === "/login" ? "page" : undefined}
		>
			로그인
		</Link>
	);
}
