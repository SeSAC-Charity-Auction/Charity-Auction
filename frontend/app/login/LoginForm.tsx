"use client";

import { useActionState, useState } from "react";
import loginAction from "./loginAction";
import LoginState from "./LoginState";
import styles from "./page.module.css";

const idle: LoginState = { status: "idle", email: "" };

export default function LoginForm({ next }: { next: string }) {
	const [state, formAction, pending] = useActionState(loginAction, idle);
	const [showPassword, setShowPassword] = useState(false);
	const error = state.status === "error" ? state.message : "";

	return (
		<form action={formAction} className={styles.form}>
			<input type="hidden" name="next" value={next} />

			<div className={styles.field}>
				<label htmlFor="login-email" className={styles.label}>
					이메일
				</label>
				<input
					id="login-email"
					name="email"
					type="email"
					autoComplete="email"
					inputMode="email"
					defaultValue={state.email}
					placeholder="example@email.com"
					required
					disabled={pending}
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
						disabled={pending}
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
				disabled={pending}
			>
				{pending ? "로그인하는 중" : "로그인"}
			</button>
		</form>
	);
}
