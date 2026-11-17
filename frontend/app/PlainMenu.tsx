import Link from "next/link";
import styles from "./SiteHeader.module.css";

export default function PlainMenu() {
	return (
		<>
			<Link href="/" className={styles.link}>
				경매
			</Link>
			<Link href="/donations" className={styles.link}>
				기부
			</Link>
			<Link href="/mypage" className={styles.link}>
				마이페이지
			</Link>
		</>
	);
}
