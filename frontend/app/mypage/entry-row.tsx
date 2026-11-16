// app/mypage/entry-row.tsx
import type { PointEntry } from "../donations/data";
import FlipText from "../donations/flip-text";
import { relativeTime } from "../donations/format";
import styles from "./page.module.css";

const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;

export default function EntryRow({ entry }: { entry: PointEntry }) {
	const earn = entry.pointType === "적립";
	return (
		<li className={styles.entry}>
			<div>
				<p className={styles.entryDesc}>{entry.description}</p>
				<p className={styles.entryTime}>
					{entry.pointType}{" "}
					<FlipText text={relativeTime(entry.createdAt)} />
				</p>
			</div>
			<p
				className={`${styles.entryAmount} ${earn ? styles.earn : styles.spend}`}
			>
				{earn ? "+" : "−"}
				<FlipText text={pt(Math.abs(entry.pointAmount))} />
			</p>
		</li>
	);
}
