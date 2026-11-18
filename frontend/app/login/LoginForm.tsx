"use client";

import { useState } from "react";
import styles from "./page.module.css";

// error는 로그인에 실패해 돌아왔을 때 주소에 붙는 코드예요. (EMPTY, LOGIN_FAILED, UNKNOWN)
const MESSAGES: Record<string, string> = {
	EMPTY: "이메일과 비밀번호를 모두 입력해 주세요.",
	LOGIN_FAILED: "이메일 또는 비밀번호가 올바르지 않아요.",
	UNKNOWN: "로그인하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

// 서버 액션이 아니라 일반 폼 전송(POST /api/login)이에요. 그래야 브라우저가 로그인으로 알아보고
// 비밀번호를 저장하고 자동으로 채워 줘요.
export default function LoginForm({
	next,
	error: code
}: {
	next: string;
	error?: string;
}) {
	const [showPassword, setShowPassword] = useState(false);
	const error = code ? (MESSAGES[code] ?? MESSAGES.UNKNOWN) : "";

	return (
		<form action="/api/login" method="post" className={styles.form}>
			<input type="hidden" name="next" value={next} />

			<div className={styles.field}>
				<label htmlFor="login-email" className={styles.label}>
					이메일
				</label>
				<input
					id="login-email"
					name="email"
					type="email"
					// 비밀번호 관리자는 아이디 칸을 "username"으로 알아봐요. (이메일로 로그인해도 마찬가지예요.)
					autoComplete="username"
					inputMode="email"
					placeholder="example@email.com"
					required
					aria-invalid={error ? true : undefined}
					aria-describedby={error ? "login-error" : undefined}
					className={styles.input}
				/>
			</div>

			<div className={styles.field}>
				<label htmlFor="login-password" className={styles.label}>
					비밀번호
				</label>
				<div className={styles.passwordRow}>
					<input
						id="login-password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete="current-password"
						required
						aria-invalid={error ? true : undefined}
						aria-describedby={error ? "login-error" : undefined}
						className={`${styles.input} ${styles.passwordInput}`}
					/>
					<button
						type="button"
						className={styles.reveal}
						onClick={() => setShowPassword((v) => !v)}
						aria-pressed={showPassword}
						aria-controls="login-password"
					>
						{showPassword ? "숨기기" : "보기"}
					</button>
				</div>
			</div>

			<p
				id="login-error"
				className={styles.error}
				role={error ? "alert" : undefined}
			>
				{error}
			</p>

			<button
				type="submit"
				className={`${styles.btn} ${styles.btnPrimary} ${styles.submit}`}
							>
				로그인
			</button>
		</form>
	);
}
