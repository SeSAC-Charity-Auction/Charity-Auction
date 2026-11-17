// app/donations/[targetId]/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../fonts";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";
import TargetContent from "./TargetContent";

export default function TargetPage({
	params
}: {
	params: Promise<{ targetId: string }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main className={styles.wrap}>
				<Link href="/donations" className={styles.back}>
					기부 현황으로 돌아가기
				</Link>
				<Suspense fallback={<LoadingState />}>
					<TargetContent params={params} />
				</Suspense>
			</main>
		</div>
	);
}
