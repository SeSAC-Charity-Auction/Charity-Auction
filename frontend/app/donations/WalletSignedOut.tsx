import Link from "next/link";
import { display } from "./fonts";
import styles from "./page.module.css";

export default function WalletSignedOut() {
	return (
		<div className={styles.walletOut}>
			<div>
				<p className={`${styles.walletOutTitle} ${display.className}`}>
					로그인하면 내 포인트를 볼 수 있어요
				</p>
				<p className={styles.walletLabel}>
					포인트가 있어야 기부할 수 있어요.
				</p>
			</div>
			<Link
				href="/login"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				로그인하기
			</Link>
		</div>
	);
}
