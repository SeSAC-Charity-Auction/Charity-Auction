"use client";

import { useActionState, useRef, useState } from "react";
import loginStyles from "../login/page.module.css";
import checkDuplicateAction, { DuplicateResult } from "./checkDuplicateAction";
import { Field, validateField } from "./rules";
import SignupState from "./SignupState";
import signupAction from "./signupAction";
import styles from "./page.module.css";

const idle: SignupState = { status: "idle" };

type Dup = Partial<Record<"email" | "nickname", DuplicateResult>>;

export default function SignupForm({ next }: { next: string }) {
	const [state, formAction, pending] = useActionState(signupAction, idle);
	const [showPassword, setShowPassword] = useState(false);
	// 입력칸을 벗어날 때 알려 주는 오류와 중복 확인 결과예요.
	const [local, setLocal] = useState<Partial<Record<Field, string>>>({});
	const [dup, setDup] = useState<Dup>({});
	// 서버가 돌려준 오류는, 그 칸을 고치기 시작하면 지워요.
	const [seen, setSeen] = useState(state);
	const [edited, setEdited] = useState<Field[]>([]);
	if (seen !== state) {
		setSeen(state);
		setEdited([]);
	}
	const passwordRef = useRef<HTMLInputElement>(null);

	const values = state.status === "error" ? state.values : undefined;
	const serverErrors = state.status === "error" ? state.errors : {};
	const formError = state.status === "error" ? state.message : "";

	const errorOf = (f: Field) =>
		local[f] || (edited.includes(f) ? "" : (serverErrors[f] ?? ""));

	const touch = (f: Field) => setEdited((e) => (e.includes(f) ? e : [...e, f]));

	function onBlur(f: Field, value: string) {
		const v = f === "password" || f === "passwordConfirm" ? value : value.trim();
		const message = validateField(f, v, passwordRef.current?.value ?? "");
		setLocal((l) => ({ ...l, [f]: message }));
		if ((f === "email" || f === "nickname") && !message) {
			checkDuplicateAction(f, v).then((r) =>
				setDup((d) => ({ ...d, [f]: r }))
			);
		}
	}

	function onChange(f: Field) {
		touch(f);
		setLocal((l) => (l[f] ? { ...l, [f]: "" } : l));
		if (f === "email" || f === "nickname") {
			setDup((d) => (d[f] ? { ...d, [f]: null } : d));
		}
	}

	// 칸 하나의 안내 문구예요. 오류가 있으면 오류를, 없으면 중복 확인 결과를 보여줘요.
	function hint(f: Field) {
		const error = errorOf(f);
		if (error) {
			return (
				<p
					id={`signup-${f}-msg`}
					className={loginStyles.error}
					role="alert"
				>
					{error}
				</p>
			);
		}
		const d = f === "email" || f === "nickname" ? dup[f] : null;
		if (d) {
			return (
				<p
					id={`signup-${f}-msg`}
					className={d.available ? styles.ok : loginStyles.error}
					role="status"
				>
					{d.message}
				</p>
			);
		}
		return null;
	}

	const describedBy = (f: Field, extra?: string) => {
		const ids = [extra, errorOf(f) || (f === "email" || f === "nickname") && dup[f] ? `signup-${f}-msg` : ""]
			.filter(Boolean)
			.join(" ");
		return ids || undefined;
	};
	const invalid = (f: Field) => Boolean(errorOf(f)) || (f !== "password" && f !== "passwordConfirm" && f !== "name" && dup[f as "email" | "nickname"]?.available === false);

	return (
		<form action={formAction} className={loginStyles.form} noValidate>
			<input type="hidden" name="next" value={next} />

			<div className={loginStyles.field}>
				<label htmlFor="signup-email" className={loginStyles.label}>
					이메일
				</label>
				<input
					id="signup-email"
					name="email"
					type="email"
					autoComplete="email"
					inputMode="email"
					defaultValue={values?.email}
					placeholder="example@email.com"
					maxLength={254}
					required
					disabled={pending}
					aria-invalid={invalid("email") || undefined}
					aria-describedby={describedBy("email")}
					className={loginStyles.input}
					onChange={() => onChange("email")}
					onBlur={(e) => onBlur("email", e.target.value)}
				/>
				{hint("email")}
			</div>

			<div className={loginStyles.field}>
				<label htmlFor="signup-password" className={loginStyles.label}>
					비밀번호
				</label>
				<div className={loginStyles.passwordRow}>
					<input
						ref={passwordRef}
						id="signup-password"
						name="password"
						type={showPassword ? "text" : "password"}
						autoComplete="new-password"
						maxLength={20}
						required
						disabled={pending}
						aria-invalid={errorOf("password") ? true : undefined}
						aria-describedby={describedBy("password", "signup-password-help")}
						className={`${loginStyles.input} ${loginStyles.passwordInput}`}
						onChange={() => onChange("password")}
						onBlur={(e) => onBlur("password", e.target.value)}
					/>
					<button
						type="button"
						className={loginStyles.reveal}
						onClick={() => setShowPassword((v) => !v)}
						aria-pressed={showPassword}
						aria-controls="signup-password signup-password-confirm"
					>
						{showPassword ? "숨기기" : "보기"}
					</button>
				</div>
				<p id="signup-password-help" className={styles.help}>
					8자 이상 20자 이하로 입력해 주세요.
				</p>
				{hint("password")}
			</div>

			<div className={loginStyles.field}>
				<label
					htmlFor="signup-password-confirm"
					className={loginStyles.label}
				>
					비밀번호 확인
				</label>
				<input
					id="signup-password-confirm"
					name="passwordConfirm"
					type={showPassword ? "text" : "password"}
					autoComplete="new-password"
					maxLength={20}
					required
					disabled={pending}
					aria-invalid={errorOf("passwordConfirm") ? true : undefined}
					aria-describedby={describedBy("passwordConfirm")}
					className={loginStyles.input}
					onChange={() => onChange("passwordConfirm")}
					onBlur={(e) => onBlur("passwordConfirm", e.target.value)}
				/>
				{hint("passwordConfirm")}
			</div>

			<div className={loginStyles.field}>
				<label htmlFor="signup-nickname" className={loginStyles.label}>
					닉네임
				</label>
				<input
					id="signup-nickname"
					name="nickname"
					type="text"
					autoComplete="nickname"
					defaultValue={values?.nickname}
					placeholder="2자 이상 10자 이하"
					maxLength={10}
					required
					disabled={pending}
					aria-invalid={invalid("nickname") || undefined}
					aria-describedby={describedBy("nickname", "signup-nickname-help")}
					className={loginStyles.input}
					onChange={() => onChange("nickname")}
					onBlur={(e) => onBlur("nickname", e.target.value)}
				/>
				<p id="signup-nickname-help" className={styles.help}>
					경매와 기부 내역에 보이는 이름이에요.
				</p>
				{hint("nickname")}
			</div>

			<div className={loginStyles.field}>
				<label htmlFor="signup-name" className={loginStyles.label}>
					이름
				</label>
				<input
					id="signup-name"
					name="name"
					type="text"
					autoComplete="name"
					defaultValue={values?.name}
					placeholder="2자 이상 10자 이하"
					maxLength={10}
					required
					disabled={pending}
					aria-invalid={errorOf("name") ? true : undefined}
					aria-describedby={describedBy("name")}
					className={loginStyles.input}
					onChange={() => onChange("name")}
					onBlur={(e) => onBlur("name", e.target.value)}
				/>
				{hint("name")}
			</div>

			<p
				className={loginStyles.error}
				role={formError ? "alert" : undefined}
			>
				{formError}
			</p>

			<button
				type="submit"
				className={`${loginStyles.btn} ${loginStyles.btnPrimary} ${loginStyles.submit}`}
				disabled={pending}
			>
				{pending ? "가입하는 중" : "회원가입"}
			</button>
		</form>
	);
}
