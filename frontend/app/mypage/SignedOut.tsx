import Link from "next/link";
import { display } from "../donations/fonts";
import styles from "./page.module.css";

export default function SignedOut() {
	return (
		<div className={styles.signedOut}>
			<h1 className={`${styles.signedOutTitle} ${display.className}`}>
				로그인하면 마이페이지를 볼 수 있어요
			</h1>
			<p className={styles.muted}>
				내 정보와 포인트 내역은 로그인한 뒤에 확인할 수 있어요.
			</p>
			<Link
				href="/login"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				로그인하기
			</Link>
		</div>
	);
}
