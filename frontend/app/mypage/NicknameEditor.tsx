"use client";

// app/mypage/nickname-editor.tsx
// 닉네임 옆의 "변경" 버튼을 누르면 그 자리에서 입력칸이 열려요.

import { useActionState, useEffect, useRef, useState } from "react";
import changeNicknameAction from "./changeNicknameAction";
import NicknameState from "./NicknameState";
import styles from "./page.module.css";

const idle: NicknameState = { status: "idle" };

export default function NicknameEditor({
	nickname,
	displayClassName
}: {
	nickname: string;
	displayClassName: string;
}) {
	const [state, formAction, pending] = useActionState(
		changeNicknameAction,
		idle
	);
	// 입력칸을 연 시점의 결과를 기억해 두고, 그 뒤에 새 성공 결과가 오면 닫힌 것으로 봐요.
	const [openedAt, setOpenedAt] = useState<NicknameState | null>(null);
	const editing =
		openedAt !== null &&
		!(state.status === "success" && state !== openedAt);
	const setEditing = (open: boolean) => setOpenedAt(open ? state : null);
	const inputRef = useRef<HTMLInputElement>(null);
	const buttonRef = useRef<HTMLButtonElement>(null);
	const wasEditing = useRef(false);
	// 열리면 입력칸으로, 닫히면 "변경" 버튼으로 포커스를 옮겨요.
	useEffect(() => {
		if (editing) inputRef.current?.select();
		else if (wasEditing.current) buttonRef.current?.focus();
		wasEditing.current = editing;
	}, [editing]);
	if (!editing) {
		return (
			<div className={styles.nicknameRow}>
				<p className={`${styles.nickname} ${displayClassName}`}>
					{nickname}
				</p>
				<button
					ref={buttonRef}
					type="button"
					className={styles.smallBtn}
					onClick={() => setEditing(true)}
				>
					닉네임 변경
				</button>
			</div>
		);
	}
	return (
		<form
			action={formAction}
			className={styles.nicknameForm}
			onKeyDown={(e) => {
				if (e.key === "Escape") setEditing(false);
			}}
		>
			<input
				ref={inputRef}
				name="nickname"
				defaultValue={nickname}
				minLength={2}
				maxLength={10}
				required
				autoComplete="off"
				aria-label="새 닉네임 (2자 이상 10자 이하)"
				className={styles.nicknameInput}
				disabled={pending}
			/>
			<button
				type="submit"
				className={styles.smallBtn}
				disabled={pending}
			>
				{pending ? "저장 중" : "저장"}
			</button>
			<button
				type="button"
				className={styles.smallBtn}
				disabled={pending}
				onClick={() => setEditing(false)}
			>
				취소
			</button>
			<p
				className={styles.nicknameError}
				role={state.status === "error" ? "alert" : undefined}
			>
				{state.status === "error" ? state.message : ""}
			</p>
		</form>
	);
}
