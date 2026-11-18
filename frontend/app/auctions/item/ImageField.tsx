"use client";

import { useEffect, useState } from "react";
import loginStyles from "../../login/page.module.css";
import styles from "./itemForm.module.css";
import { IMAGE_ACCEPT, imageError } from "./itemRules";

export default function ImageField({
	currentImage = null,
	required,
	disabled,
	serverError
}: {
	currentImage?: string | null;
	required: boolean;
	disabled: boolean;
	serverError?: string;
}) {
	const [preview, setPreview] = useState<string | null>(null);
	const [localError, setLocalError] = useState<string | null>(null);

	useEffect(() => {
		return () => {
			if (preview) URL.revokeObjectURL(preview);
		};
	}, [preview]);

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (!file) {
			setPreview(null);
			setLocalError(null);
			return;
		}
		const message = imageError(file);
		if (message) {
			e.target.value = "";
			setPreview(null);
			setLocalError(message);
			return;
		}
		setLocalError(null);
		setPreview(URL.createObjectURL(file));
	};

	const error = localError ?? serverError;
	const shown = preview ?? currentImage;

	return (
		<div className={loginStyles.field}>
			<label htmlFor="item-file" className={loginStyles.label}>
				물품 이미지{required ? "" : " (바꿀 때만 골라 주세요)"}
			</label>
			<div className={styles.imageRow}>
				<div className={styles.preview} aria-hidden={shown ? undefined : true}>
					{shown ?
						<img
							src={shown}
							alt={preview ? "새로 고른 이미지 미리보기" : "지금 등록된 이미지"}
							className={styles.previewImg}
						/>
					:	<span className={styles.previewEmpty}>미리보기</span>}
				</div>
				<div className={styles.imageControls}>
					<input
						id="item-file"
						name="file"
						data-field="file"
						type="file"
						accept={IMAGE_ACCEPT}
						required={required}
						disabled={disabled}
						onChange={onChange}
						aria-invalid={error ? true : undefined}
						aria-describedby="item-file-help item-file-error"
						className={styles.fileInput}
					/>
					<p id="item-file-help" className={styles.help}>
						PNG, JPG, GIF, WEBP · 2MB 이하
					</p>
				</div>
			</div>
			<p id="item-file-error" className={styles.fieldError} role={error ? "alert" : undefined}>
				{error ?? ""}
			</p>
		</div>
	);
}
