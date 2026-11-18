import type { Metadata } from "next";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { ACCESS_COOKIE } from "../auth/authCookies";
import { body, display } from "../donations/fonts";
import loginStyles from "../login/page.module.css";
import safeNext from "../login/safeNext";
import styles from "./page.module.css";
import SignupForm from "./SignupForm";

export const metadata: Metadata = {
	title: "회원가입",
	description:
		"가치잇다에 가입하고 경매에 입찰하고, 모은 포인트로 기부해 보세요."
};

type SearchParams = Promise<{ next?: string | string[] }>;

async function SignupContent({ searchParams }: { searchParams: SearchParams }) {
	const { next: raw } = await searchParams;
	const next = safeNext(Array.isArray(raw) ? raw[0] : raw);
	const loggedIn = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);

	if (loggedIn) {
		return (
			<div className={loginStyles.already}>
				<p className={loginStyles.lead}>이미 로그인되어 있어요.</p>
				<div className={loginStyles.actions}>
					<Link
						href={next}
						className={`${loginStyles.btn} ${loginStyles.btnPrimary}`}
					>
						계속하기
					</Link>
				</div>
			</div>
		);
	}
	return (
		<>
			<SignupForm next={next} />
			<p className={styles.switch}>
				이미 계정이 있나요?{" "}
				<Link
					href={next === "/" ? "/login" : `/login?next=${encodeURIComponent(next)}`}
					className={styles.switchLink}
				>
					로그인
				</Link>
			</p>
		</>
	);
}

export default function SignupPage({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	return (
		<div className={`${loginStyles.page} ${body.className}`}>
			<main
				id="main-content"
				tabIndex={-1}
				className={loginStyles.wrap}
			>
				<section className={loginStyles.card} aria-labelledby="signup-title">
					<p className={loginStyles.eyebrow}>가치잇다</p>
					<h1
						id="signup-title"
						className={`${loginStyles.title} ${display.className}`}
					>
						회원가입
					</h1>
					<p className={loginStyles.muted}>
						가입하면 경매에 입찰하고, 모은 포인트로 기부할 수 있어요.
					</p>
					<Suspense
						fallback={
							<p className={loginStyles.loading} role="status">
								회원가입 화면을 준비하는 중이에요.
							</p>
						}
					>
						<SignupContent searchParams={searchParams} />
					</Suspense>
				</section>
				<Link href="/" className={loginStyles.back}>
					경매 목록으로 돌아가기
				</Link>
			</main>
		</div>
	);
}
