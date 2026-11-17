import styles from "./page.module.css";

export default function LoadingState() {
	return (
		<p className={styles.loading} role="status">
			기부 현황을 불러오는 중이에요.
		</p>
	);
}
