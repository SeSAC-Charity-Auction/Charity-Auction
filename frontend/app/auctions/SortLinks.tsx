import Link from "next/link";
import AuctionFilters, { SORTS } from "./AuctionFilters";
import buildHref from "./buildHref";
import styles from "./page.module.css";

export default function SortLinks({ filters }: { filters: AuctionFilters }) {
	return (
		<nav aria-label="정렬" className={styles.sorts}>
			{SORTS.map((s) => (
				<Link
					key={s.value}
					href={buildHref(filters, { sort: s.value })}
					className={`${styles.sort} ${filters.sort === s.value ? styles.sortOn : ""}`}
					aria-current={filters.sort === s.value ? "true" : undefined}
				>
					{s.label}
				</Link>
			))}
		</nav>
	);
}
