import Link from "next/link";
import styles from "./page.module.css";

export default function SiteHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.headerInner}>
				<Link href="/" className={styles.brand}>
					Charity Auction
				</Link>
				<nav aria-label="주요 메뉴" className={styles.nav}>
					<Link
						href="/"
						className={styles.navLink}
						aria-current="page"
					>
						경매
					</Link>
					<Link href="/donations" className={styles.navLink}>
						기부
					</Link>
					<Link href="/mypage" className={styles.navLink}>
						마이페이지
					</Link>
				</nav>
			</div>
		</header>
	);
}
