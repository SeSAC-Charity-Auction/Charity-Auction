import FlipText from "../flip-text";
import { display } from "../fonts";
import styles from "./page.module.css";

export default function Stat({
	label,
	value,
	unit
}: {
	label: string;
	value: number;
	unit: string;
}) {
	return (
		<div className={styles.stat}>
			<dt className={styles.statLabel}>{label}</dt>
			<dd className={styles.statValue}>
				<span className={`${styles.statNum} ${display.className}`}>
					<FlipText text={value.toLocaleString("ko-KR")} />
				</span>
				<span className={styles.statUnit}>{unit}</span>
			</dd>
		</div>
	);
}
