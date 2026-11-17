"use client";

// app/donations/[targetId]/target-image-uploader.tsx
// 기부처 이미지를 누르면 파일을 고르고, 고르자마자 올려요. (ADMIN 또는 개발 환경에서만 쓰여요)

import { useActionState, useRef } from "react";
import TargetImageState from "./TargetImageState";
import styles from "./page.module.css";
import uploadTargetImageAction from "./uploadTargetImageAction";

const idle: TargetImageState = { status: "idle" };

export default function TargetImageUploader({
	targetId,
	targetName,
	children
}: {
	targetId: number;
	targetName: string;
	children: React.ReactNode; // 지금 보여 줄 이미지 또는 첫 글자
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction, pending] = useActionState(
		uploadTargetImageAction,
		idle
	);
	return (
		<form ref={formRef} action={formAction}>
			<input type="hidden" name="targetId" value={targetId} />
			<label
				className={`${styles.heroThumb} ${styles.heroEditable}`}
				aria-label={`${targetName} 이미지 바꾸기`}
			>
				{children}
				<span className={styles.heroHint} aria-hidden="true">
					{pending ? "올리는 중" : "이미지 변경"}
				</span>
				<input
					type="file"
					name="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					className={styles.heroInput}
					disabled={pending}
					onChange={(e) => {
						if (e.currentTarget.files?.length)
							formRef.current?.requestSubmit();
					}}
				/>
			</label>
			<p
				className={styles.heroError}
				role={state.status === "error" ? "alert" : undefined}
			>
				{state.status === "error" ? state.message : ""}
			</p>
		</form>
	);
}
