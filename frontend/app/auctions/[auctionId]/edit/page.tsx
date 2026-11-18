import type { Metadata } from "next";
import Link from "next/link";
import { connection } from "next/server";
import { Suspense } from "react";
import isLoggedIn from "../../../auth/isLoggedIn";
import { body, display } from "../../../donations/fonts";
import getMyProfile from "../../../donations/getMyProfile";
import loginStyles from "../../../login/page.module.css";
import Category from "../../Category";
import getCategories from "../../getCategories";
import Blocked from "../../item/Blocked";
import editability from "../../item/editability";
import getAuctionForEdit from "../../item/getAuctionForEdit";
import ItemForm from "../../item/ItemForm";
import styles from "../../item/itemForm.module.css";
import updateAuctionAction from "./updateAuctionAction";

export const metadata: Metadata = {
	title: "경매 물품 수정"
};

type Params = Promise<{ auctionId: string }>;

const toInputValue = (dateTime: string) => dateTime.slice(0, 16);

async function EditAuctionContent({ params }: { params: Params }) {
	await connection();
	const id = Number((await params).auctionId);
	const detailHref = `/auctions/${id}`;
	const back = { href: detailHref, label: "경매 상세로 돌아가기" };

	if (!Number.isInteger(id) || id <= 0) {
		return <Blocked title="경매를 찾을 수 없어요." actions={[{ href: "/", label: "경매 목록으로" }]} />;
	}
	if (!(await isLoggedIn())) {
		return (
			<Blocked
				title="로그인하면 내가 등록한 경매를 수정할 수 있어요."
				actions={[
					{
						href: `/login?next=${encodeURIComponent(`${detailHref}/edit`)}`,
						label: "로그인하기",
						primary: true
					},
					back
				]}
			/>
		);
	}

	const [result, me, categories] = await Promise.all([
		getAuctionForEdit(id),
		getMyProfile().catch(() => null),
		getCategories().catch((): Category[] | null => null)
	]);

	if (result.kind === "notFound") {
		return <Blocked title="경매를 찾을 수 없어요." text="삭제됐을 수 있어요." actions={[{ href: "/", label: "경매 목록으로" }]} />;
	}
	if (result.kind === "loginRequired" || !me) {
		return (
			<Blocked
				title="로그인이 만료됐어요."
				text="다시 로그인한 뒤 시도해 주세요."
				actions={[
					{
						href: `/login?next=${encodeURIComponent(`${detailHref}/edit`)}`,
						label: "로그인하기",
						primary: true
					},
					back
				]}
			/>
		);
	}
	if (result.kind === "error" || !categories) {
		return (
			<Blocked
				title="수정 화면을 불러오지 못했어요."
				text="잠시 뒤에 다시 시도해 주세요."
				actions={[{ href: `${detailHref}/edit`, label: "다시 시도", primary: true }, back]}
			/>
		);
	}

	const auction = result.auction;
	if (auction.userId !== me.userId) {
		return <Blocked title="내가 등록한 경매만 수정할 수 있어요." actions={[back]} />;
	}
	const check = editability(auction);
	if (!check.editable) {
		return <Blocked title="이 경매는 수정할 수 없어요." text={check.reason} actions={[back]} />;
	}

	return (
		<>
			<p className={styles.notice}>
				경매가 <strong>시작되기 전</strong>이고 <strong>입찰이 없을 때</strong>만
				수정할 수 있어요. 시작 시각은 지금보다 뒤, 마감 시각은 시작 시각보다
				뒤여야 해요.
			</p>
			<ItemForm
				mode="edit"
				action={updateAuctionAction}
				categories={categories}
				auctionId={auction.id}
				initial={{
					title: auction.title,
					description: auction.description ?? "",
					categoryId: auction.categoryId,
					startPrice: auction.startPrice,
					startAt: toInputValue(auction.startAt),
					endAt: toInputValue(auction.endAt),
					image: auction.image
				}}
			/>
		</>
	);
}

export default function EditAuctionPage({ params }: { params: Params }) {
	return (
		<div className={`${loginStyles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
				<section className={loginStyles.card} aria-labelledby="edit-auction-title">
					<p className={loginStyles.eyebrow}>경매 수정</p>
					<h1
						id="edit-auction-title"
						className={`${loginStyles.title} ${display.className}`}
					>
						경매 물품 수정
					</h1>
					<Suspense
						fallback={
							<p className={loginStyles.loading} role="status">
								수정 화면을 준비하는 중이에요.
							</p>
						}
					>
						<EditAuctionContent params={params} />
					</Suspense>
				</section>
				<Link href="/" className={loginStyles.back}>
					경매 목록으로 돌아가기
				</Link>
			</main>
		</div>
	);
}
