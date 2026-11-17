"use client";

// 낙찰 기회를 수락하거나 포기하는 폼이에요.

import { useActionState } from "react";
import decideOfferAction from "../decideOfferAction";
import OfferState from "../OfferState";
import styles from "./page.module.css";

const idle: OfferState = { status: "idle" };
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;

export default function OfferForm({
	candidateId,
	bidPrice,
	secondsLeft
}: {
	candidateId: number;
	bidPrice: number;
	secondsLeft: number | null; // 처음 그릴 때 남은 초
}) {
	const [state, formAction, pending] = useActionState(
		decideOfferAction,
		idle
	);
	const reward = Math.floor(bidPrice / 2); // 낙찰가의 50% (백엔드와 같은 계산)
	if (state.status === "accepted") {
		return (
			<div className={styles.offer} role="status">
				<h2 className={styles.offerTitle}>낙찰이 완료됐어요!</h2>
				<p className={styles.offerText}>
					<span className={styles.offerPoints}>
						{pt(state.pointAmount)}
					</span>
					가 지급됐어요. 위쪽 메뉴의 붉은 점에서 확인할 수 있어요.
				</p>
			</div>
		);
	}
	if (state.status === "rejected") {
		return (
			<div className={styles.offer} role="status">
				<h2 className={styles.offerTitle}>낙찰을 포기했어요</h2>
				<p className={styles.offerText}>
					다음 순위 입찰자에게 기회가 넘어가요.
				</p>
			</div>
		);
	}
	return (
		<form action={formAction} className={styles.offer}>
			<input type="hidden" name="candidateId" value={candidateId} />
			<h2 className={styles.offerTitle}>최고가로 낙찰됐어요!</h2>
			<p className={styles.offerText}>
				내 입찰가 {won(bidPrice)}으로 낙찰 기회를 얻었어요. 수락하면
				낙찰가의 50%인{" "}
				<span className={styles.offerPoints}>{pt(reward)}</span>를 받고,
				판매자도 나머지 50%를 받아요.
				{secondsLeft !== null &&
					` 지금부터 약 ${secondsLeft}초 안에 선택해 주세요.`}
			</p>
			{state.status === "error" && (
				<p className={styles.error} role="alert">
					{state.message}
				</p>
			)}
			<div className={styles.offerActions}>
				<button
					type="submit"
					name="decision"
					value="accept"
					className={styles.offerAccept}
					disabled={pending}
				>
					{pending ?
						"처리 중이에요"
					:	`낙찰 수락하고 ${pt(reward)} 받기`}
				</button>
				<button
					type="submit"
					name="decision"
					value="reject"
					className={styles.offerReject}
					disabled={pending}
				>
					포기하기
				</button>
			</div>
		</form>
	);
}
