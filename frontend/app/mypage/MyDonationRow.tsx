import Link from "next/link";
import FlipText from "../donations/FlipText";
import MyDonation from "../donations/MyDonation";
import { relativeTime } from "../donations/format";
import styles from "./page.module.css";
import pt from "./pt";
import Thumb from "./Thumb";

// 기부 이력 한 줄: 어느 기부처에 언제, 얼마를 기부했는지
export default function MyDonationRow({ donation }: { donation: MyDonation }) {
	return (
		<li className={styles.row}>
			<Thumb image={donation.targetImage} title={donation.targetName} />
			<div className={styles.rowBody}>
				<p className={styles.rowTitle}>
					<Link
						href={`/donations/${donation.targetId}`}
						className={styles.rowLink}
					>
						{donation.targetName}
					</Link>
				</p>
				<p className={styles.rowMeta}>
					<span>
						<FlipText text={relativeTime(donation.createdAt)} />
					</span>
				</p>
			</div>
			<div className={styles.rowSide}>
				<span className={styles.rowLabel}>기부한 포인트</span>
				<p className={`${styles.rowPrice} ${styles.spend}`}>
					−<FlipText text={pt(donation.donationAmount)} />
				</p>
			</div>
		</li>
	);
}
