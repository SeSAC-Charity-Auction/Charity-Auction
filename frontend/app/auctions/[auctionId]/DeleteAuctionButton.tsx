"use client";

// 판매자가 경매를 삭제하는 버튼이에요. 실수로 지우지 않도록 확인 창을 띄워 한 번 더 물어봐요.

import { useActionState, useRef } from "react";
import deleteAuctionAction from "./deleteAuctionAction";
import DeleteState from "./DeleteState";
import styles from "./SellerActions.module.css";

const idle: DeleteState = { status: "idle" };

export default function DeleteAuctionButton({
	auctionId,
	title
}: {
	auctionId: number;
	title: string;
}) {
	const [state, formAction, pending] = useActionState(deleteAuctionAction, idle);
	const dialogRef = useRef<HTMLDialogElement>(null);
	// <dialog>의 showModal()은 뒤 화면을 막고, Esc와 포커스 이동을 알아서 해 줘요.
	return (
		<>
			<button
				type="button"
				className={`${styles.button} ${styles.danger}`}
				onClick={() => dialogRef.current?.showModal()}
			>
				경매 삭제
			</button>
			<dialog
				ref={dialogRef}
				className={styles.dialog}
				aria-labelledby="delete-dialog-title"
				aria-describedby="delete-dialog-desc"
				// 처리 중에는 Esc로 닫히지 않게 해요.
				onCancel={(e) => {
					if (pending) e.preventDefault();
				}}
			>
				<form action={formAction}>
					<input type="hidden" name="auctionId" value={auctionId} />
					<h3 id="delete-dialog-title" className={styles.dialogTitle}>
						이 경매를 삭제할까요?
					</h3>
					<p id="delete-dialog-desc" className={styles.dialogText}>
						삭제한 경매는 다시 복구할 수 없어요.
					</p>
					<div className={styles.dialogActions}>
						<button
							type="submit"
							className={`${styles.button} ${styles.dangerSolid}`}
							disabled={pending}
						>
							{pending ? "삭제하는 중" : "네, 삭제할게요"}
						</button>
						<button
							type="button"
							className={styles.button}
							disabled={pending}
							autoFocus
							onClick={() => dialogRef.current?.close()}
						>
							취소
						</button>
					</div>
					<p
						className={styles.error}
						role={state.status === "error" ? "alert" : undefined}
					>
						{state.status === "error" ? state.message : ""}
					</p>
				</form>
			</dialog>
		</>
	);
}
