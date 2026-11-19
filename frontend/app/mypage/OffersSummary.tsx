import Link from "next/link";
import MyCandidate from "../auctions/MyCandidate";
import styles from "./page.module.css";

// 마이페이지 맨 위의 낙찰 기회 안내예요.
// 선택을 기다리는 기회가 있으면 눈에 띄게, 없으면 조용히 기록 보기 링크만 보여줘요.
export default function OffersSummary({ candidates }: { candidates: MyCandidate[] }) {
	const offered = candidates.filter((c) => c.status === "OFFERED").length;
	const waiting = candidates.filter((c) => c.status === "WAITING").length;
	if (candidates.length === 0) return null;
	if (offered > 0) {
		return (
			<div className={styles.callout} role="status">
				<div>
					<p className={styles.calloutTitle}>
						선택을 기다리는 낙찰 기회가 {offered.toLocaleString("ko-KR")}건 있어요
					</p>
					<p className={styles.muted}>기한이 지나면 다음 순위로 넘어가요.</p>
				</div>
				<Link href="/mypage/offers" className={`${styles.btn} ${styles.btnPrimary}`}>
					지금 선택하기
				</Link>
			</div>
		);
	}
	return (
		<div className={`${styles.callout} ${styles.calloutQuiet}`}>
			<p>
				내가 받은 낙찰 기회
				{waiting > 0 && ` · 순번 대기 ${waiting.toLocaleString("ko-KR")}건`}
			</p>
			<Link
				href="/mypage/offers"
				className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
			>
				기록 보기
			</Link>
		</div>
	);
}
