"use client";

// app/mypage/withdraw-section.tsx
// 실수로 탈퇴하지 않도록, 버튼을 누르면 한 번 더 확인을 받아요.

import { useActionState, useEffect, useRef, useState } from "react";
import { withdrawAction, type WithdrawState } from "./actions";
import styles from "./page.module.css";

const idle: WithdrawState = { status: "idle" };

export default function WithdrawSection({ balance }: { balance: number }) {
	const [confirming, setConfirming] = useState(false);
	const [state, formAction, pending] = useActionState(withdrawAction, idle);
	const cancelRef = useRef<HTMLButtonElement>(null);
	const openRef = useRef<HTMLButtonElement>(null);
	const wasConfirming = useRef(false);

	// 확인 단계가 열리면 "취소"(안전한 쪽)에 포커스를 두고, 닫히면 처음 버튼으로 돌려놔요.
	useEffect(() => {
		if (confirming) cancelRef.current?.focus();
		else if (wasConfirming.current) openRef.current?.focus();
		wasConfirming.current = confirming;
	}, [confirming]);

	return (
		<section className={styles.withdraw} aria-labelledby="withdraw-title">
			<h2 id="withdraw-title" className={styles.withdrawTitle}>
				회원 탈퇴
			</h2>
			{!confirming ?
				<>
					<p className={styles.withdrawText}>
						탈퇴하면 더 이상 로그인할 수 없어요.
					</p>
					<button
						ref={openRef}
						type="button"
						className={styles.smallBtn}
						onClick={() => setConfirming(true)}
					>
						탈퇴하기
					</button>
				</>
			:	<form
					action={formAction}
					onKeyDown={(e) => {
						if (e.key === "Escape" && !pending) setConfirming(false);
					}}
				>
					<p className={styles.withdrawText}>
						정말 탈퇴할까요? 남은 포인트{" "}
						<strong>{balance.toLocaleString("ko-KR")}P</strong>는
						사라지고 되돌릴 수 없어요. 지금까지의 기부 기록은 이름
						없이 그대로 남아요.
					</p>
					<div className={styles.withdrawActions}>
						<button
							type="submit"
							className={`${styles.smallBtn} ${styles.dangerBtn}`}
							disabled={pending}
						>
							{pending ? "처리 중" : "네, 탈퇴할게요"}
						</button>
						<button
							ref={cancelRef}
							type="button"
							className={styles.smallBtn}
							disabled={pending}
							onClick={() => setConfirming(false)}
						>
							취소
						</button>
					</div>
					<p
						className={styles.withdrawError}
						role={state.status === "error" ? "alert" : undefined}
					>
						{state.status === "error" ? state.message : ""}
					</p>
				</form>
			}
		</section>
	);
}
