import DonationRecord from "../DonationRecord";
import FlipText from "../flip-text";
import { won } from "../format";
import styles from "./page.module.css";
import relativeTime from "./relativeTime";

export default function DonationRow({ record }: { record: DonationRecord }) {
	return (
		<li className={styles.donation}>
			<div>
				<p className={styles.donationName}>
					{record.donorName}님이 기부했어요
				</p>
				<p className={styles.donationTime}>
					<FlipText text={relativeTime(record.createdAt)} />
				</p>
			</div>
			<p className={styles.donationAmount}>
				<FlipText text={won(record.donationAmount)} />
			</p>
		</li>
	);
}
