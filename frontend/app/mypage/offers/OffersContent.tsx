import Link from "next/link";
import { connection } from "next/server";
import OfferForm from "../../auctions/[auctionId]/OfferForm";
import getMyCandidates from "../../auctions/getMyCandidates";
import MyCandidate, { CandidateStatus } from "../../auctions/MyCandidate";
import secondsUntil from "../../auctions/secondsUntil";
import { display } from "../../donations/fonts";
import CandidateRow from "../CandidateRow";
import styles from "../page.module.css";
import SearchParams from "./SearchParams";

// 지난 기록 탭. (선택 대기·순번 대기는 위쪽에 따로 보여줘요)
const TABS: { value: string; label: string; statuses: CandidateStatus[] }[] = [
	{
		value: "all",
		label: "전체",
		statuses: ["COMPLETED", "REJECTED", "EXPIRED", "NOT_SELECTED"]
	},
	{ value: "completed", label: "낙찰 완료", statuses: ["COMPLETED"] },
	{ value: "rejected", label: "포기", statuses: ["REJECTED"] },
	{ value: "expired", label: "기한 만료", statuses: ["EXPIRED"] }
];

const first = (v: string | string[] | undefined) =>
	Array.isArray(v) ? v[0] : v;

const by = (statuses: CandidateStatus[]) => (c: MyCandidate) =>
	statuses.includes(c.status);

export default async function OffersContent({
	searchParams
}: {
	searchParams: SearchParams;
}) {
	// 남은 시간(현재 시각)과 내 낙찰 기회는 요청할 때마다 달라요.
	await connection();
	const params = await searchParams;
	const tab = TABS.find((t) => t.value === first(params.tab)) ?? TABS[0];
	const all = await getMyCandidates();
	if (!all) {
		return (
			<p className={styles.empty}>
				로그인하면 낙찰 기회를 볼 수 있어요.{" "}
				<Link
					href="/login?next=%2Fmypage%2Foffers"
					className={styles.textLink}
				>
					로그인하기
				</Link>
			</p>
		);
	}
	const offered = all.filter(by(["OFFERED"]));
	const waiting = all.filter(by(["WAITING"]));
	const history = all.filter(by(tab.statuses));
	const hrefOf = (value: string) =>
		value === "all" ? "/mypage/offers" : `/mypage/offers?tab=${value}`;

	return (
		<>
			<h1 className={`${styles.pageTitle} ${display.className}`}>
				내가 받은 낙찰 기회
			</h1>

			{/* 1. 지금 선택해야 하는 기회: 기한이 짧아서 맨 위에 크게 보여줘요 */}
			<section aria-labelledby="offered-title">
				<div className={styles.sectionHead}>
					<h2
						id="offered-title"
						className={`${styles.h2} ${display.className}`}
					>
						지금 선택해야 해요
					</h2>
					<p className={styles.muted}>
						수락하면 낙찰가의 50%를 포인트로 받아요. 기한이 지나면
						다음 순위로 넘어가요.
					</p>
				</div>
				{offered.length > 0 ?
					<ul className={styles.offerGrid}>
						{offered.map((o) => (
							<li key={o.candidateId}>
								<OfferForm
									candidateId={o.candidateId}
									bidPrice={o.bidPrice}
									secondsLeft={
										o.deadlineAtIso ?
											secondsUntil(o.deadlineAtIso)
										:	null
									}
									deadlineAtIso={o.deadlineAtIso}
									rank={o.candidateRank}
									item={{
										auctionId: o.auctionId,
										title: o.title
									}}
								/>
							</li>
						))}
					</ul>
				:	<p className={styles.empty}>
						지금 선택할 낙찰 기회가 없어요. 입찰한 경매가 마감되고
						내 순서가 오면 이곳과 위쪽 메뉴에 바로 나타나요.
					</p>
				}
			</section>

			{/* 2. 순번 대기: 앞 순위가 넘기면 기회가 와요 */}
			{waiting.length > 0 && (
				<section aria-labelledby="waiting-title">
					<div className={styles.sectionHead}>
						<h2
							id="waiting-title"
							className={`${styles.h2} ${display.className}`}
						>
							순번 대기 중
						</h2>
						<p className={styles.muted}>
							{waiting.length.toLocaleString("ko-KR")}건
						</p>
					</div>
					<ul className={styles.rowList}>
						{waiting.map((c) => (
							<CandidateRow key={c.candidateId} candidate={c} />
						))}
					</ul>
				</section>
			)}

			{/* 3. 지난 기록 */}
			<section aria-labelledby="history-title">
				<div className={styles.sectionHead}>
					<h2
						id="history-title"
						className={`${styles.h2} ${display.className}`}
					>
						지난 기록
					</h2>
					<Link
						href="/mypage/activity?tab=wins"
						className={`${styles.btn} ${styles.btnGhost} ${styles.btnSmall}`}
					>
						낙찰 이력 보기
					</Link>
				</div>
				<nav aria-label="기록 보기 선택" className={styles.tabs}>
					{TABS.map((t) => (
						<Link
							key={t.value}
							href={hrefOf(t.value)}
							className={`${styles.tab} ${t.value === tab.value ? styles.tabOn : ""}`}
							aria-current={
								t.value === tab.value ? "page" : undefined
							}
							scroll={false}
						>
							{t.label}
						</Link>
					))}
				</nav>
				{history.length > 0 ?
					<ul className={styles.rowList}>
						{history.map((c) => (
							<CandidateRow key={c.candidateId} candidate={c} />
						))}
					</ul>
				:	<p className={styles.empty}>
						{tab.value === "all" ?
							"아직 처리된 낙찰 기회가 없어요."
						:	`${tab.label} 기록이 없어요.`}
					</p>
				}
			</section>
		</>
	);
}
