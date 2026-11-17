import Link from "next/link";
import { connection } from "next/server";
import DonationTarget from "../DonationTarget";
import { display } from "../fonts";
import DonateForm from "./DonateForm";
import styles from "./page.module.css";
import getMyPoints from "../getMyPoints";

export default async function DonatePanel({
	target
}: {
	target: DonationTarget;
}) {
	if (!target.isActive || target.isAchieved) {
		return (
			<div className={styles.panelQuiet}>
				<h2
					className={`${styles.panelQuietTitle} ${display.className}`}
				>
					{target.isAchieved ?
						"목표 금액을 달성했어요"
					:	"기부가 마감됐어요"}
				</h2>
				<p className={styles.panelQuietText}>
					{target.isAchieved ?
						"모금이 목표에 닿아서 더 이상 기부를 받지 않아요. 다른 기부처를 둘러보세요."
					:	"이 기부처는 더 이상 기부를 받지 않아요. 다른 기부처를 둘러보세요."
					}
				</p>
				<Link href="/donations#targets" className={styles.textLink}>
					다른 기부처 보기
				</Link>
			</div>
		);
	}
	await connection();
	const points = await getMyPoints();
	if (!points) {
		return (
			<div className={styles.panelQuiet}>
				<h2
					className={`${styles.panelQuietTitle} ${display.className}`}
				>
					로그인하면 기부할 수 있어요
				</h2>
				<p className={styles.panelQuietText}>
					기부는 내 포인트로 해요. 로그인하고 이어서 해 보세요.
				</p>
				<Link
					href="/login"
					className={`${styles.btn} ${styles.btnPrimary}`}
				>
					로그인하기
				</Link>
			</div>
		);
	}
	return (
		<DonateForm
			targetId={target.targetId}
			targetName={target.targetName}
			balance={points.balance}
			currentTotal={target.totalDonation}
			targetAmount={target.targetAmount}
		/>
	);
}
