import Link from "next/link";
import AuctionFilters, { STATUS_TABS } from "./AuctionFilters";
import buildHref from "./buildHref";
import styles from "./page.module.css";

export default function StatusTabs({ filters }: { filters: AuctionFilters }) {
	return (
		<nav aria-label="경매 상태" className={styles.tabs}>
			{STATUS_TABS.map((t) => (
				<Link
					key={t.value}
					href={buildHref(filters, { status: t.value })}
					className={`${styles.tab} ${filters.status === t.value ? styles.tabOn : ""}`}
					aria-current={
						filters.status === t.value ? "true" : undefined
					}
				>
					{t.label}
				</Link>
			))}
		</nav>
	);
}
