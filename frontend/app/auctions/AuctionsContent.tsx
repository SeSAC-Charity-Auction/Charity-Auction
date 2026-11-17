import FlipText from "../donations/FlipText";
import Link from "next/link";
import { connection } from "next/server";
import AuctionCard from "./AuctionCard";
import CategoryFilter from "./CategoryFilter";
import getAuctions from "./getAuctions";
import getCategories from "./getCategories";
import styles from "./page.module.css";
import Pagination from "./Pagination";
import parseFilters from "./parseFilters";
import SearchForm from "./SearchForm";
import SortLinks from "./SortLinks";
import StatusTabs from "./StatusTabs";

export default async function AuctionsContent({
	searchParams
}: {
	searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
	// 남은 시간(현재 시각)과 API 응답은 요청할 때마다 달라서 미리 만들어 둘 수 없어요.
	await connection();
	const filters = parseFilters(await searchParams);
	const [categories, data] = await Promise.all([
		getCategories(),
		getAuctions(filters)
	]);
	const filtered =
		filters.categoryId !== null || filters.status !== "" || filters.keyword;
	return (
		<>
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
			{data.items.length > 0 ?
				<ul className={styles.grid}>
					{data.items.map((a) => (
						<li key={a.auctionId} className={styles.gridItem}>
							<AuctionCard auction={a} />
						</li>
					))}
				</ul>
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
