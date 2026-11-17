"use client";

// app/mypage/avatar-uploader.tsx
// 동그라미(프로필 사진 자리)를 누르면 파일을 고르고, 고르자마자 올려요.

import { useActionState, useRef } from "react";
import styles from "./page.module.css";
import uploadImageAction from "./uploadImageAction";
import UploadState from "./UploadState";

const idle: UploadState = { status: "idle" };

export default function AvatarUploader({
	nickname,
	children
}: {
	nickname: string;
	children: React.ReactNode; // 지금 보여 줄 사진 또는 닉네임 첫 글자
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction, pending] = useActionState(
		uploadImageAction,
		idle
	);
	return (
		<form ref={formRef} action={formAction} className={styles.avatarForm}>
			<label
				className={`${styles.avatar} ${styles.avatarButton}`}
				aria-label={`${nickname} 프로필 사진 바꾸기`}
			>
				{children}
				<span className={styles.avatarHint} aria-hidden="true">
					{pending ? "올리는 중" : "사진 변경"}
				</span>
				<input
					type="file"
					name="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					className={styles.avatarInput}
					disabled={pending}
					onChange={(e) => {
						if (e.currentTarget.files?.length)
							formRef.current?.requestSubmit();
					}}
				/>
			</label>
			<p
				className={styles.avatarError}
				role={state.status === "error" ? "alert" : undefined}
			>
				{state.status === "error" ? state.message : ""}
			</p>
		</form>
	);
}
