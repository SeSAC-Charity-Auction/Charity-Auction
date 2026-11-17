import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { connection } from "next/server";
import { won } from "../../donations/format";
import formatDateTime from "../formatDateTime";
import getAuction from "../getAuction";
import isClosedAuction from "../isClosedAuction";
import timeLabel from "../timeLabel";
import AuctionImageUploader from "./AuctionImageUploader";
import BidHistory from "./BidHistory";
import BidPanel from "./BidPanel";
import OfferPanel from "./OfferPanel";
import styles from "./page.module.css";

const STATUS_LABEL = {
	SCHEDULED: "예정",
	IN_PROGRESS: "진행 중",
	CANCELED: "취소"
} as const;

// 마감된 경매에 붙일 작은 설명이에요.
const CLOSED_NOTE = {
	CLOSED: "낙찰자를 정하는 중이에요",
	COMPLETED: "낙찰 완료",
	FAILED: "유찰",
	IN_PROGRESS: "마감 처리 중이에요"
} as const;

export default async function AuctionDetailContent({
	params
}: {
	params: Promise<{ auctionId: string }>;
}) {
	// 남은 시간(현재 시각)과 API 응답은 요청할 때마다 달라서 미리 만들어 둘 수 없어요.
	await connection();

	const id = Number((await params).auctionId);
	if (!Number.isInteger(id) || id <= 0) notFound();
	const auction = await getAuction(id);
	if (!auction) notFound();

	const closed = isClosedAuction(auction);
	const live = auction.status === "IN_PROGRESS" && !closed;
	const time = timeLabel(auction);

	const photo =
		auction.image ?
			// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
			// eslint-disable-next-line @next/next/no-img-element
			<img
				src={auction.image}
				alt={`${auction.title} 이미지`}
				className={styles.photoImg}
			/>
		:	<span className={styles.photoFallback} aria-hidden="true">
				{auction.title.slice(0, 1)}
			</span>;

	return (
		<>
			<nav className={styles.crumbs} aria-label="현재 위치">
				<Link href="/" className={styles.crumb}>
					경매
				</Link>
				<span aria-hidden="true">/</span>
				<Link
					href={`/?category=${auction.categoryId}`}
					className={styles.crumb}
				>
					{auction.categoryName}
				</Link>
			</nav>

			<div className={styles.layout}>
				<div className={styles.media}>
					{process.env.NODE_ENV === "development" ?
						<AuctionImageUploader
							auctionId={auction.auctionId}
							title={auction.title}
						>
							{photo}
						</AuctionImageUploader>
					:	<div className={styles.photo}>{photo}</div>}

					<section aria-labelledby="desc-title" className={styles.block}>
						<h2 id="desc-title" className={styles.h2}>
							상품 설명
						</h2>
						<p className={styles.desc}>
							{auction.description ?? "등록된 설명이 없어요."}
						</p>
					</section>
				</div>

				<aside className={styles.side}>
					<div className={styles.head}>
						<span
							className={`${styles.badge} ${closed ? styles.badgeClosed : live ? styles.badgeLive : styles.badgeOther}`}
						>
							{closed ? "마감" : STATUS_LABEL[auction.status as keyof typeof STATUS_LABEL]}
						</span>
						{closed && (
							<span className={styles.closedNote}>
								{CLOSED_NOTE[auction.status as keyof typeof CLOSED_NOTE]}
							</span>
						)}
						<h1 className={styles.title}>{auction.title}</h1>
						<p className={styles.seller}>
							판매자 {auction.sellerNickname}
						</p>
					</div>

					<dl className={styles.facts}>
						<div className={styles.factWide}>
							<dt>{auction.bidCount > 0 ? "현재 입찰가" : "시작 가격"}</dt>
							<dd className={styles.price}>{won(auction.currentPrice)}</dd>
						</div>
						<div>
							<dt>시작 가격</dt>
							<dd>{won(auction.startPrice)}</dd>
						</div>
						<div>
							<dt>입찰</dt>
							<dd>{auction.bidCount.toLocaleString("ko-KR")}회</dd>
						</div>
						<div>
							<dt>경매 시작</dt>
							<dd>{formatDateTime(auction.startAt)}</dd>
						</div>
						<div>
							<dt>경매 종료</dt>
							<dd>{formatDateTime(auction.endAt)}</dd>
						</div>
					</dl>

					{(live || auction.status === "SCHEDULED") && (
						<p className={time.urgent ? styles.timeUrgent : styles.time}>
							{time.text}
						</p>
					)}
					{closed && (
						<p className={styles.timeClosed}>
							마감 · {formatDateTime(auction.endAt)}
						</p>
					)}

					{auction.status === "CLOSED" && (
						<Suspense fallback={null}>
							<OfferPanel auctionId={auction.auctionId} />
						</Suspense>
					)}

					<BidPanel auction={auction} />
				</aside>
			</div>

			<BidHistory bids={auction.recentBids} total={auction.bidCount} />
		</>
	);
}
