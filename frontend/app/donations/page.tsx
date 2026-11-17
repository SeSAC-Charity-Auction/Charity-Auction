// app/donations/page.tsx
import { Suspense } from "react";
import DonationsContent from "./DonationsContent";
import { body } from "./fonts";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";

export default function DonationsPage() {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Suspense fallback={<LoadingState />}>
					<DonationsContent />
				</Suspense>
			</main>
		</div>
	);
}
