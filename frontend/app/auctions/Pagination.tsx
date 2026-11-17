import Link from "next/link";
import AuctionFilters from "./AuctionFilters";
import buildHref from "./buildHref";
import styles from "./page.module.css";

export default function Pagination({
	filters,
	totalPages
}: {
	filters: AuctionFilters;
	totalPages: number;
}) {
	if (totalPages <= 1) return null;
	const current = filters.page;
	const from = Math.max(1, Math.min(current - 2, totalPages - 4));
	const to = Math.min(totalPages, from + 4);
	const numbers = Array.from({ length: to - from + 1 }, (_, i) => from + i);
	return (
		<nav className={styles.pager} aria-label="쪽 이동">
			<Link
				href={buildHref(filters, { page: current - 1 })}
				className={`${styles.pageBtn} ${current <= 1 ? styles.pageOff : ""}`}
				aria-disabled={current <= 1}
				tabIndex={current <= 1 ? -1 : undefined}
			>
				이전
			</Link>
			{numbers.map((n) => (
				<Link
					key={n}
					href={buildHref(filters, { page: n })}
					className={`${styles.pageBtn} ${n === current ? styles.pageOn : ""}`}
					aria-current={n === current ? "page" : undefined}
				>
					{n}
				</Link>
			))}
			<Link
				href={buildHref(filters, { page: current + 1 })}
				className={`${styles.pageBtn} ${current >= totalPages ? styles.pageOff : ""}`}
				aria-disabled={current >= totalPages}
				tabIndex={current >= totalPages ? -1 : undefined}
			>
				다음
			</Link>
		</nav>
	);
}
