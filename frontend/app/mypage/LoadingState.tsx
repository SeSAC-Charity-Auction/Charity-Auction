import styles from "./page.module.css";

export default function LoadingState() {
	return (
		<p className={styles.loading} role="status">
			내 정보를 불러오는 중이에요.
		</p>
	);
}
