import { display } from "./fonts";
import styles from "./page.module.css";

export default function EmptyTicket() {
	return (
		<div className={styles.ticket}>
			<div className={styles.ticketBody}>
				<p className={`${styles.ticketName} ${display.className}`}>
					아직 기부 기록이 없어요
				</p>
				<p className={styles.ticketHint}>
					첫 기부가 생기면 이곳에 가장 먼저 보여요.
				</p>
			</div>
			<div className={styles.ticketStub}>
				<p className={styles.ticketPriceLabel}>기부금</p>
				<p className={`${styles.ticketPrice} ${display.className}`}>
					0원
				</p>
			</div>
		</div>
	);
}
