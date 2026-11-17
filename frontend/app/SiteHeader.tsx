import Link from "next/link";
import { Suspense } from "react";
import MyPageLink from "./MyPageLink";
import styles from "./SiteHeader.module.css";

type Current = "auctions" | "donations" | "mypage";

const MENUS: { key: Current; href: string; label: string }[] = [
	{ key: "auctions", href: "/", label: "경매" },
	{ key: "donations", href: "/donations", label: "기부" }
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
					{/* 로그인한 사람마다 다른 값(프로필 사진)이라 따로 <Suspense>로 감싸요. 늦어져도 나머지 메뉴는 먼저 보여요. */}
					<Suspense
						fallback={
							<Link href="/mypage" className={styles.link}>
								마이페이지
							</Link>
						}
					>
						<MyPageLink current={current === "mypage"} />
					</Suspense>
				</nav>
			</div>
		</header>
	);
}
