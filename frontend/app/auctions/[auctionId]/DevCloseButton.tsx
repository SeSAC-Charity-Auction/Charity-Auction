"use client";

// 테스트용 버튼이에요. 누르면 이 경매를 지금 바로 마감해요. (개발 환경에서만 보여요)

import { useActionState } from "react";
import AuctionImageState from "../AuctionImageState";
import closeAuctionNowAction from "../closeAuctionNowAction";
import styles from "./page.module.css";

const idle: AuctionImageState = { status: "idle" };

export default function DevCloseButton({ auctionId }: { auctionId: number }) {
	const [state, formAction, pending] = useActionState(
		closeAuctionNowAction,
		idle
	);
	return (
		<form action={formAction} className={styles.devClose}>
			<input type="hidden" name="auctionId" value={auctionId} />
			<button
				type="submit"
				className={styles.devCloseBtn}
				disabled={pending}
			>
				{pending ? "마감하는 중이에요" : "지금 바로 마감하기 (개발 모드)"}
			</button>
			<p
				className={styles.devCloseNote}
				role={state.status === "error" ? "alert" : undefined}
			>
				{state.status === "error" ? state.message : "테스트용 기능이에요."}
			</p>
		</form>
	);
}
