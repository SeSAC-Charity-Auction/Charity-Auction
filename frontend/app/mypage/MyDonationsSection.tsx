import Link from "next/link";
import { display } from "../donations/fonts";
import MyDonationPage from "../donations/MyDonationPage";
import MyDonationRow from "./MyDonationRow";
import styles from "./page.module.css";
import pt from "./pt";

// 마이페이지의 "기부 이력" (최근 몇 건과, 기부한 포인트 합계)
export default function MyDonationsSection({ data }: { data: MyDonationPage }) {
	return (
		<section id="my-donations" aria-labelledby="my-donations-title">
			<div className={styles.sectionHead}>
				<h2
					id="my-donations-title"
					className={`${styles.h2} ${display.className}`}
				>
					기부 이력
				</h2>
				<div className={styles.sectionSide}>
					<p className={styles.muted}>
						모두 {data.totalElements.toLocaleString("ko-KR")}건 · 기부한 포인트{" "}
						<strong>{pt(data.totalAmount)}</strong>
					</p>
					{data.totalElements > data.items.length && (
						<Link
							href="/mypage/activity?tab=donations"
							className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
						>
							전체 조회
						</Link>
					)}
				</div>
			</div>
			{data.items.length > 0 ?
				<ul className={styles.rowList}>
					{data.items.map((d) => (
						<MyDonationRow key={d.donationId} donation={d} />
					))}
				</ul>
			:	<p className={styles.empty}>
					아직 기부한 내역이 없어요.{" "}
					<Link href="/donations#targets" className={styles.textLink}>
						기부처 둘러보기
					</Link>
				</p>
			}
		</section>
	);
}
