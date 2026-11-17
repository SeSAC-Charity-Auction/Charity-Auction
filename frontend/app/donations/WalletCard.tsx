import Link from "next/link";
import balanceSeries from "./balanceSeries";
import FlipText from "./FlipText";
import { display } from "./fonts";
import { relativeTime } from "./format";
import MyPoints from "./MyPoints";
import styles from "./page.module.css";
import Sparkline from "./Sparkline";
import pt from "../mypage/pt";

export default function WalletCard({ points }: { points: MyPoints }) {
	const hasHistory = points.recent.length > 0;
	const entries = points.recent.slice(0, 3);
	return (
		<div className={styles.wallet}>
			<div className={styles.walletMain}>
				<div className={styles.walletBalanceRow}>
					<span
						className={`${styles.coin} ${display.className}`}
						aria-hidden="true"
					>
						P
					</span>
					<div>
						<p className={styles.walletLabel}>
							지금 쓸 수 있는 포인트
						</p>
						<p
							className={`${styles.walletBalance} ${display.className}`}
						>
							<FlipText
								text={points.balance.toLocaleString("ko-KR")}
							/>
							<span className={styles.walletUnit}>P</span>
						</p>
					</div>
				</div>
				<div className={styles.walletActions}>
					<a
						href="#targets"
						className={`${styles.btn} ${styles.btnPrimary}`}
					>
						기부하러 가기
					</a>
					<Link href="/mypage#points" className={styles.textLink}>
						포인트 내역 전체 보기
					</Link>
				</div>
			</div>
			<div className={styles.walletSide}>
				{hasHistory ?
					<>
						<Sparkline
							values={balanceSeries(points)}
							label={`최근 포인트 변화예요. 지금은 ${pt(points.balance)}을(를) 갖고 있어요.`}
						/>
						<p className={styles.sparkCaption}>
							<FlipText
								text={`최근 ${points.recent.length}번의 포인트 변화`}
							/>
						</p>
						<ul className={styles.entryList}>
							{entries.map((e) => (
								<li key={e.pointId} className={styles.entry}>
									<div>
										<p className={styles.entryDesc}>
											{e.description}
										</p>
										<p className={styles.entryTime}>
											{e.pointType}{" "}
											<FlipText
												text={relativeTime(e.createdAt)}
											/>
										</p>
									</div>
									<p
										className={`${styles.entryAmount} ${e.pointType === "적립" ? styles.earn : styles.spend}`}
									>
										{e.pointType === "적립" ?
											"+"
										:	"\u2212"}
										<FlipText
											text={pt(Math.abs(e.pointAmount))}
										/>
									</p>
								</li>
							))}
						</ul>
					</>
				:	<p className={styles.walletEmpty}>
						아직 포인트 내역이 없어요. 포인트가 생기면 이곳에
						기록돼요.
					</p>
				}
			</div>
		</div>
	);
}
