import type { Metadata } from "next";
import Link from "next/link";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { ACCESS_COOKIE } from "../auth/authCookies";
import logoutAction from "../auth/logoutAction";
import { body, display } from "../donations/fonts";
import LoginForm from "./LoginForm";
import styles from "./page.module.css";
import safeNext from "./safeNext";

export const metadata: Metadata = {
	title: "로그인"
};

type SearchParams = Promise<{ next?: string | string[] }>;

async function LoginContent({ searchParams }: { searchParams: SearchParams }) {
	const { next: raw } = await searchParams;
	const next = safeNext(Array.isArray(raw) ? raw[0] : raw);
	const loggedIn = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);

	if (loggedIn) {
		return (
			<div className={styles.already}>
				<p className={styles.lead}>이미 로그인되어 있어요.</p>
				<div className={styles.actions}>
					<Link href={next} className={`${styles.btn} ${styles.btnPrimary}`}>
						계속하기
					</Link>
					<form action={logoutAction}>
						<button type="submit" className={`${styles.btn} ${styles.btnGhost}`}>
							다른 계정으로 로그인
						</button>
					</form>
				</div>
			</div>
		);
	}
	return (
		<>
			<LoginForm next={next} />
			<p className={styles.switch}>
				아직 계정이 없나요?{" "}
				<Link
					href={next === "/" ? "/signup" : `/signup?next=${encodeURIComponent(next)}`}
					className={styles.switchLink}
				>
					회원가입
				</Link>
			</p>
		</>
	);
}

export default function LoginPage({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<section className={styles.card} aria-labelledby="login-title">
					<p className={styles.eyebrow}>가치잇다</p>
					<h1
						id="login-title"
						className={`${styles.title} ${display.className}`}
					>
						로그인
					</h1>
					<p className={styles.muted}>
						로그인하면 경매에 입찰하고, 모은 포인트로 기부할 수 있어요.
					</p>
					<Suspense
						fallback={
							<p className={styles.loading} role="status">
								로그인 화면을 준비하는 중이에요.
							</p>
						}
					>
						<LoginContent searchParams={searchParams} />
					</Suspense>
				</section>
				<Link href="/" className={styles.back}>
					경매 목록으로 돌아가기
				</Link>
			</main>
		</div>
	);
}
