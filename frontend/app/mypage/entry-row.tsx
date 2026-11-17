// app/mypage/entry-row.tsx

import FlipText from "../donations/FlipText";
import { relativeTime } from "../donations/format";
import PointEntry from "../donations/PointEntry";
import styles from "./page.module.css";
import pt from "./pt";

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
