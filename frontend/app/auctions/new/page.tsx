import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import isLoggedIn from "../../auth/isLoggedIn";
import { body, display } from "../../donations/fonts";
import loginStyles from "../../login/page.module.css";
import Category from "../Category";
import getCategories from "../getCategories";
import Blocked from "../item/Blocked";
import ItemForm from "../item/ItemForm";
import styles from "../item/itemForm.module.css";
import createAuctionAction from "./createAuctionAction";

export const metadata: Metadata = {
	title: "경매 물품 등록",
	description: "기부로 이어질 물품을 경매에 올려 보세요."
};

async function NewAuctionContent() {
	await connection();
	if (!(await isLoggedIn())) {
		return (
			<Blocked
				title="로그인하면 경매 물품을 등록할 수 있어요."
				actions={[
					{ href: "/login?next=%2Fauctions%2Fnew", label: "로그인하기", primary: true },
					{ href: "/signup", label: "회원가입" }
				]}
			/>
		);
	}

	let categories: Category[];
	try {
		categories = await getCategories();
	} catch {
		return (
			<Blocked
				title="카테고리를 불러오지 못했어요."
				text="잠시 뒤에 다시 시도해 주세요."
				actions={[{ href: "/auctions/new", label: "다시 시도", primary: true }]}
			/>
		);
	}

	return (
		<>
			<p className={styles.notice}>
				경매가 <strong>시작된 뒤에는 내용을 고칠 수 없어요.</strong> 나중에
				고치고 싶다면 <strong>시작 시각을 예약</strong>해 두세요. 시작 전까지는
				상세 페이지에서 수정할 수 있어요.
			</p>
			<ItemForm
				mode="create"
				action={createAuctionAction}
				categories={categories}
				initial={{ title: "", description: "", categoryId: null, startPrice: null }}
			/>
		</>
	);
}

export default function NewAuctionPage() {
	return (
		<div className={`${loginStyles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
				<section className={loginStyles.card} aria-labelledby="new-auction-title">
					<p className={loginStyles.eyebrow}>경매 등록</p>
					<h1
						id="new-auction-title"
						className={`${loginStyles.title} ${display.className}`}
					>
						경매 물품 등록
					</h1>
					<p className={loginStyles.muted}>
						낙찰된 금액은 포인트로 돌아와 기부로 이어져요.
					</p>
					<Suspense
						fallback={
							<p className={loginStyles.loading} role="status">
								등록 화면을 준비하는 중이에요.
							</p>
						}
					>
						<NewAuctionContent />
					</Suspense>
				</section>
				<Link href="/" className={loginStyles.back}>
					경매 목록으로 돌아가기
				</Link>
			</main>
		</div>
	);
}
