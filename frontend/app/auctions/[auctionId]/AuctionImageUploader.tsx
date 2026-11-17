"use client";

// 경매 이미지를 누르면 파일을 고르고, 고르자마자 올려요. (개발 환경에서만 쓰여요)

import { useActionState, useRef } from "react";
import AuctionImageState from "../AuctionImageState";
import uploadAuctionImageAction from "../uploadAuctionImageAction";
import styles from "./page.module.css";

const idle: AuctionImageState = { status: "idle" };

export default function AuctionImageUploader({
	auctionId,
	title,
	children
}: {
	auctionId: number;
	title: string;
	children: React.ReactNode; // 지금 보여 줄 이미지 또는 첫 글자
}) {
	const formRef = useRef<HTMLFormElement>(null);
	const [state, formAction, pending] = useActionState(
		uploadAuctionImageAction,
		idle
	);

	return (
		<form ref={formRef} action={formAction}>
			<input type="hidden" name="auctionId" value={auctionId} />
			<label
				className={`${styles.photo} ${styles.photoEditable}`}
				aria-label={`${title} 이미지 바꾸기`}
			>
				{children}
				<span className={styles.photoHint} aria-hidden="true">
					{pending ? "올리는 중" : "이미지 변경 (개발 모드)"}
				</span>
				<input
					type="file"
					name="file"
					accept="image/png,image/jpeg,image/webp,image/gif"
					className={styles.photoInput}
					disabled={pending}
					onChange={(e) => {
						if (e.currentTarget.files?.length)
							formRef.current?.requestSubmit();
					}}
				/>
			</label>
			<p
				className={styles.photoError}
				role={state.status === "error" ? "alert" : undefined}
			>
				{state.status === "error" ? state.message : ""}
			</p>
		</form>
	);
}
