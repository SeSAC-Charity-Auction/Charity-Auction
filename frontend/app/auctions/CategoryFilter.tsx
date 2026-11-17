import Link from "next/link";
import AuctionFilters from "./AuctionFilters";
import buildHref from "./buildHref";
import Category from "./Category";
import styles from "./page.module.css";

export default function CategoryFilter({
	categories,
	filters
}: {
	categories: Category[];
	filters: AuctionFilters;
}) {
	return (
		<nav aria-label="카테고리" className={styles.chips}>
			<Link
				href={buildHref(filters, { categoryId: null })}
				className={`${styles.chip} ${filters.categoryId === null ? styles.chipOn : ""}`}
				aria-current={filters.categoryId === null ? "true" : undefined}
			>
				전체
			</Link>
			{categories.map((c) => (
				<Link
					key={c.categoryId}
					href={buildHref(filters, { categoryId: c.categoryId })}
					className={`${styles.chip} ${filters.categoryId === c.categoryId ? styles.chipOn : ""}`}
					aria-current={
						filters.categoryId === c.categoryId ? "true" : undefined
					}
				>
					{c.categoryName}
				</Link>
			))}
		</nav>
	);
}
