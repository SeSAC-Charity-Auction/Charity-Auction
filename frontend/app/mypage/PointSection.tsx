import Link from "next/link";
import FlipText from "../donations/FlipText";
import { display } from "../donations/fonts";
import MyPoints from "../donations/MyPoints";
import EntryRow from "./EntryRow";
import styles from "./page.module.css";
import pt from "./pt";

export default function PointSection({
	points,
	balance
}: {
	points: MyPoints;
	balance: number;
}) {
	return (
		<section
			id="points"
			className={styles.points}
			aria-labelledby="points-title"
		>
			<div className={styles.sectionHead}>
				<h2
					id="points-title"
					className={`${styles.h2} ${display.className}`}
				>
					포인트 내역
				</h2>
				<div className={styles.sectionSide}>
					<p className={styles.muted}>
						<FlipText
							text={`지금 ${pt(balance)}을(를) 갖고 있어요. 최근 ${points.recent.length}건만 보여요.`}
						/>
					</p>
					<Link
						href="/mypage/points"
						className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
					>
						전체 조회
					</Link>
				</div>
			</div>
			{points.recent.length > 0 ?
				<ol className={styles.entryList}>
					{points.recent.map((e) => (
						<EntryRow key={e.pointId} entry={e} />
					))}
				</ol>
			:	<p className={styles.empty}>
					아직 포인트 내역이 없어요. 기부하면 이곳에 기록돼요.{" "}
					<Link href="/donations#targets" className={styles.textLink}>
						기부처 둘러보기
					</Link>
				</p>
			}
		</section>
	);
}
