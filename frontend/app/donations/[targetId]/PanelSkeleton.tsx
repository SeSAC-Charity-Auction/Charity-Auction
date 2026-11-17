import styles from "./page.module.css";

export default function PanelSkeleton() {
	return (
		<div className={styles.panelSkeleton} role="status">
			<span className={styles.srOnly}>기부 폼을 불러오는 중이에요.</span>
		</div>
	);
}
