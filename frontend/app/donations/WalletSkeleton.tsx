import styles from "./page.module.css";

export default function WalletSkeleton() {
	return (
		<div className={styles.walletSkeleton} role="status">
			<span className={styles.srOnly}>
				내 포인트를 불러오는 중이에요.
			</span>
		</div>
	);
}
