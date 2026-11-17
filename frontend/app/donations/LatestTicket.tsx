import Link from "next/link";
import DonationRecord from "./DonationRecord";
import FlipText from "./FlipText";
import { display } from "./fonts";
import { relativeTime, won } from "./format";
import styles from "./page.module.css";

export default function LatestTicket({ record }: { record: DonationRecord }) {
	return (
		<div className={styles.ticket}>
			<div className={styles.ticketBody}>
				<span
					className={`${styles.stamp} ${display.className}`}
					aria-hidden="true"
				>
					기부
				</span>
				<p className={`${styles.ticketName} ${display.className}`}>
					<Link
						href={`/donations/${record.targetId}`}
						className={styles.plainLink}
					>
						{record.targetName}
					</Link>
				</p>
				<p className={styles.ticketMeta}>
					<span>{record.donorName}님</span>
					<span>
						<FlipText text={relativeTime(record.createdAt)} />
					</span>
				</p>
			</div>
			<div className={styles.ticketStub}>
				<p className={styles.ticketPriceLabel}>기부금</p>
				<p className={`${styles.ticketPrice} ${display.className}`}>
					<FlipText text={won(record.donationAmount)} />
				</p>
			</div>
		</div>
	);
}
