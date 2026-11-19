"use client";

// 낙찰 기회를 수락하거나 포기하는 폼이에요.

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import secondsUntil from "../secondsUntil";
import decideOfferAction from "../decideOfferAction";
import OfferState from "../OfferState";
import styles from "./page.module.css";

const idle: OfferState = { status: "idle" };
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;
const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;

export default function OfferForm({
	candidateId,
	bidPrice,
	secondsLeft: initialSeconds,
	deadlineAtIso,
	rank = 1,
	item
}: {
	candidateId: number;
	bidPrice: number;
	secondsLeft: number | null; // 처음 그릴 때 남은 초 (서버가 계산)
	deadlineAtIso: string | null; // 낙찰 기한 (ISO 8601)
	rank?: number; // 몇 순위로 기회를 받았는지 (1이면 최고가)
	item?: { auctionId: number; title: string }; // 마이페이지처럼 경매 밖에서 보여줄 때 어떤 경매인지 알려줘요
}) {
	const router = useRouter();
	// 남은 시간을 1초마다 줄여 보여줘요. 기한이 지나면 화면을 새로 그려서 다음 상태를 보여줘요.
	const [secondsLeft, setSecondsLeft] = useState(initialSeconds);
	useEffect(() => {
		if (!deadlineAtIso) return;
		const id = window.setInterval(() => {
			const left = secondsUntil(deadlineAtIso);
			setSecondsLeft(left);
			if (left <= 0) {
				window.clearInterval(id);
				// 만료 처리 스케줄러가 돌 시간을 조금 주고 새로 그려요.
				window.setTimeout(() => router.refresh(), 3_000);
			}
		}, 1_000);
		return () => window.clearInterval(id);
	}, [deadlineAtIso, router]);
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
			{item && (
				<p className={styles.offerItem}>
					<Link href={`/auctions/${item.auctionId}`}>{item.title}</Link>
				</p>
			)}
			<h2 className={styles.offerTitle}>
				{rank <= 1 ?
					"최고가로 낙찰됐어요!"
				:	`앞 순위가 넘겨서 ${rank}순위인 내게 낙찰 기회가 왔어요!`}
			</h2>
			<p className={styles.offerText}>
				내 입찰가 {won(bidPrice)}으로 낙찰 기회를 얻었어요. 수락하면
				낙찰가의 50%인{" "}
				<span className={styles.offerPoints}>{pt(reward)}</span>를 받고,
				판매자도 나머지 50%를 받아요.
				{secondsLeft !== null &&
					(secondsLeft > 0 ?
						` 남은 시간 ${Math.floor(secondsLeft / 60)}분 ${secondsLeft % 60}초 안에 선택해 주세요.`
					:	" 선택할 수 있는 시간이 지났어요.")}
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
					disabled={pending || secondsLeft === 0}
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
					disabled={pending || secondsLeft === 0}
				>
					포기하기
				</button>
			</div>
		</form>
	);
}
