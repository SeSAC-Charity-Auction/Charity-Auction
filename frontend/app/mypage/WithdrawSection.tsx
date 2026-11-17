"use client";

// app/mypage/withdraw-section.tsx
// 실수로 탈퇴하지 않도록, 붉은 버튼을 누르면 확인 창을 띄워 한 번 더 물어봐요.

import { useActionState, useRef } from "react";
import styles from "./page.module.css";
import WithdrawState from "./WithdrawState";
import withdrawAction from "./withdrawAction";

const idle: WithdrawState = { status: "idle" };

export default function WithdrawSection({ balance }: { balance: number }) {
	const [state, formAction, pending] = useActionState(withdrawAction, idle);
	const dialogRef = useRef<HTMLDialogElement>(null);
	// <dialog>의 showModal()은 뒤 화면을 막고, Esc와 포커스 이동(열 때 안으로, 닫을 때 원래 버튼으로)을 알아서 해 줘요.
	return (
		<section className={styles.withdraw} aria-labelledby="withdraw-title">
			<h2 id="withdraw-title" className={styles.withdrawTitle}>
				회원 탈퇴
			</h2>
			<p className={styles.withdrawText}>
				탈퇴하면 더 이상 로그인할 수 없어요.
			</p>
			<button
				type="button"
				className={`${styles.smallBtn} ${styles.dangerBtn}`}
				onClick={() => dialogRef.current?.showModal()}
			>
				회원 탈퇴
			</button>
			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby="withdraw-dialog-title"
				aria-describedby="withdraw-dialog-desc"
				// 처리 중에는 Esc로 닫히지 않게 해요.
				onCancel={(e) => {
					if (pending) e.preventDefault();
				}}
			>
				<form action={formAction}>
					<h3
						id="withdraw-dialog-title"
						className={styles.dialogTitle}
					>
						정말 탈퇴하시겠어요?
					</h3>
					<p id="withdraw-dialog-desc" className={styles.dialogText}>
						<strong>탈퇴하면 되돌릴 수 없습니다.</strong> 남은
						포인트{" "}
						<strong>{balance.toLocaleString("ko-KR")}P</strong>는
						사라지고, 다시 로그인할 수 없어요. 지금까지의 기부
						기록은 이름 없이 그대로 남아요.
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
							type="button"
							className={styles.smallBtn}
							disabled={pending}
							autoFocus
							onClick={() => dialogRef.current?.close()}
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
			</dialog>
		</section>
	);
}
