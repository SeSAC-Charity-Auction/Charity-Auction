"use client";

// 입찰 폼이에요. 입력값에 따라 화면이 바뀌어서 클라이언트 컴포넌트예요.

import { useActionState, useState } from "react";
import BidState from "../BidState";
import placeBidAction from "../placeBidAction";
import styles from "./page.module.css";

const BID_STEP = 100; // 입찰 단위 (서버는 "현재가보다 높기만" 하면 받아요)
const QUICK_ADDS = [1_000, 5_000, 10_000];
const idle: BidState = { status: "idle" };
const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export default function BidForm({
	auctionId,
	currentPrice,
	hasBids
}: {
	auctionId: number;
	currentPrice: number;
	hasBids: boolean;
}) {
	const [state, formAction, pending] = useActionState(placeBidAction, idle);
	const min = currentPrice + BID_STEP; // 지금보다 한 단위 높은 금액부터
	// 입찰이 들어와 최소 금액이 올라가면 입력값도 따라 올라가요.
	const [raw, setRaw] = useState<number | null>(null);
	const price = Math.max(raw ?? 0, min);

	return (
		<form action={formAction} className={styles.bid}>
			<input type="hidden" name="auctionId" value={auctionId} />
			<label htmlFor="bid-price" className={styles.bidLabel}>
				{hasBids ? "내 입찰 금액" : "첫 입찰 금액"}
			</label>
			<div className={styles.bidInputRow}>
				<input
					id="bid-price"
					name="bidPrice"
					type="number"
					inputMode="numeric"
					min={min}
					step={BID_STEP}
					value={price}
					onChange={(e) => setRaw(Number(e.target.value))}
					className={styles.bidInput}
					required
				/>
				<span className={styles.bidUnit}>원</span>
			</div>
			<div className={styles.quick} role="group" aria-label="금액 올리기">
				{QUICK_ADDS.map((add) => (
					<button
						key={add}
						type="button"
						className={styles.quickBtn}
						onClick={() => setRaw(price + add)} // 누를 때마다 지금 입력된 금액에 더해져요
					>
						+{add.toLocaleString("ko-KR")}
					</button>
				))}
			</div>
			<p className={styles.hint}>
				{won(min)} 이상, {BID_STEP.toLocaleString("ko-KR")}원 단위로 입찰할
				수 있어요.
			</p>

			{state.status === "error" && (
				<p className={styles.error} role="alert">
					{state.message}
				</p>
			)}
			{state.status === "success" && (
				<p className={styles.success} role="status">
					{won(state.bidPrice)}에 입찰했어요. 지금 내 입찰이 가장 높아요!
				</p>
			)}

			<button type="submit" className={styles.submit} disabled={pending}>
				{pending ? "입찰하는 중이에요" : `${won(price)} 입찰하기`}
			</button>
		</form>
	);
}
