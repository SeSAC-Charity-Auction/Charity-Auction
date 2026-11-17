// app/donations/donation-row.tsx
import Link from "next/link";
import FlipText from "./flip-text";
import { relativeTime, won } from "./format";
import styles from "./page.module.css";
import DonationRecord from "./DonationRecord";

export default function DonationRow({ record }: { record: DonationRecord }) {
	return (
		<li className={styles.donation}>
			<div className={styles.donationMain}>
				<p className={styles.donationName}>
					<Link
						href={`/donations/${record.targetId}`}
						className={styles.plainLink}
					>
						{record.targetName}
					</Link>
				</p>
				<p className={styles.donationDonor}>
					{record.donorName}님이 기부했어요
				</p>
			</div>
			<p className={styles.donationTime}>
				<FlipText text={relativeTime(record.createdAt)} />
			</p>
			<p className={styles.donationAmount}>
				<FlipText text={won(record.donationAmount)} />
			</p>
		</li>
	);
}
