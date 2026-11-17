import AuctionFilters from "./AuctionFilters";
import styles from "./page.module.css";

// 자바스크립트 없이도 동작하는 일반 GET 폼이에요. 검색하면 다른 조건은 그대로 두고 1쪽부터 보여줘요.
export default function SearchForm({ filters }: { filters: AuctionFilters }) {
	return (
		<form action="/" method="get" role="search" className={styles.search}>
			{filters.categoryId && (
				<input
					type="hidden"
					name="category"
					value={filters.categoryId}
				/>
			)}
			{filters.status && (
				<input type="hidden" name="status" value={filters.status} />
			)}
			{filters.sort !== "ending" && (
				<input type="hidden" name="sort" value={filters.sort} />
			)}
			<label className={styles.srOnly} htmlFor="auction-q">
				경매 물품 검색
			</label>
			<input
				id="auction-q"
				name="q"
				type="search"
				defaultValue={filters.keyword}
				placeholder="어떤 물건을 찾으세요?"
				maxLength={50}
				className={styles.searchInput}
			/>
			<button type="submit" className={styles.searchBtn}>
				검색
			</button>
		</form>
	);
}
