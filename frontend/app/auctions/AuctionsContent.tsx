import FlipText from "../donations/FlipText";
import Link from "next/link";
import { connection } from "next/server";
import AuctionCard from "./AuctionCard";
import CategoryFilter from "./CategoryFilter";
import { DEFAULT_STATUS } from "./constants";
import currentTime from "./currentTime";
import getAuctions from "./getAuctions";
import getCategories from "./getCategories";
import LiveAuctionPricesProvider from "./LiveAuctionPrices";
import styles from "./page.module.css";
import Pagination from "./Pagination";
import parseFilters from "./parseFilters";
import SearchForm from "./SearchForm";
import SortLinks from "./SortLinks";
import StatusTabs from "./StatusTabs";
import ListStatusWatcher from "./ListStatusWatcher";
import AuctionFilters from "./AuctionFilters";

export default async function AuctionsContent({
	searchParams
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	// 남은 시간(현재 시각)과 API 응답은 요청할 때마다 달라서 미리 만들어 둘 수 없어요.
	await connection();
	const filters = parseFilters(await searchParams);
	const [categories, data, outside] = await Promise.all([
		getCategories(),
		getAuctions(filters),
		outsideChangeAt(filters)
	]);
	const now = currentTime(); // 카드의 남은 시간이 이 시각에서 시작해 계속 흘러가요.
	const filtered =
		filters.categoryId !== null || filters.status !== DEFAULT_STATUS || filters.keyword;
	return (
		<>
		<ListStatusWatcher nextChangeAt={earliest(nextChangeAt(data.content), outside)} />
			<section className={styles.intro} aria-labelledby="auction-title">
				<h1 id="auction-title" className={styles.title}>
					경매 물품
				</h1>
				<p className={styles.lead}>
					마음에 드는 물건에 입찰하세요. 낙찰금은 기부로 이어져요.
				</p>
				<SearchForm filters={filters} />
			</section>
			<CategoryFilter categories={categories} filters={filters} />
			<div className={styles.toolbar}>
				<StatusTabs filters={filters} />
				<SortLinks filters={filters} />
			</div>
			<p className={styles.count} role="status">
				<FlipText
					text={`${data.totalElements.toLocaleString("ko-KR")}개의 경매`}
				/>
			</p>
			{data.content.length > 0 ?
				<LiveAuctionPricesProvider>
				<ul className={styles.grid}>
					{data.content.map((a) => (
						<li key={a.auctionId} className={styles.gridItem}>
							<AuctionCard auction={a} now={now} />
						</li>
					))}
				</ul>
				</LiveAuctionPricesProvider>
			:	<p className={styles.empty}>
					{filtered ?
						<>
							조건에 맞는 경매가 없어요.{" "}
							<Link href="/" className={styles.textLink}>
								조건 모두 지우기
							</Link>
						</>
					:	"지금 열려 있는 경매가 없어요. 새 경매가 등록되면 이곳에 표시돼요."
					}
				</p>
			}
			<Pagination filters={filters} totalPages={data.totalPages} />
		</>
	);
}
// 목록에서 다음으로 상태가 바뀔 시각을 골라요.
// 예정 경매는 시작 시각, 진행 중 경매는 마감 시각이에요.
// 2분 넘게 지났는데도 안 바뀐 경매(스케줄러가 꺼져 있는 경우 등)는 빼서, 계속 새로고침하지 않게 해요.
function nextChangeAt(
	auctions: { status: string; startAt: string; endAt: string }[]
): string | null {
	const since = Date.now() - 2 * 60_000;
	let next: number | null = null;
	for (const a of auctions) {
		const iso =
			a.status === "SCHEDULED" ? a.startAt
			: a.status === "IN_PROGRESS" ? a.endAt
			: null;
		if (!iso) continue;
		const t = new Date(iso).getTime();
		if (t < since) continue;
		if (next === null || t < next) next = t;
	}
	return next === null ? null : new Date(next).toISOString();
}

// 지금 탭의 목록 밖에서 곧 일어날 변경 시각이에요. (같은 카테고리·검색어 안에서)
//  - 마감 탭: 진행 중 경매가 마감되면 이 탭에 새로 들어와요 → 가장 빠른 마감 시각
//  - 진행 중 탭: 예정 경매가 시작되면 이 탭에 새로 들어와요 → 가장 빠른 시작 시각
async function outsideChangeAt(filters: AuctionFilters): Promise<string | null> {
	const target =
		filters.status === "CLOSED" ?
			{ status: "IN_PROGRESS" as const, sort: "ENDING_SOON" as const, field: "endAt" as const }
		: filters.status === "IN_PROGRESS" ?
			{ status: "SCHEDULED" as const, sort: "STARTING_SOON" as const, field: "startAt" as const }
		:	null;
	if (!target) return null;
	try {
		const page = await getAuctions({
			...filters,
			status: target.status,
			sort: target.sort,
			page: 1
		});
		const first = page.content[0];
		return first ? first[target.field] : null;
	} catch {
		return null; // 못 가져와도 목록은 그대로 보여줘요
	}
}

function earliest(a: string | null, b: string | null): string | null {
	if (!a) return b;
	if (!b) return a;
	return new Date(a).getTime() <= new Date(b).getTime() ? a : b;
}