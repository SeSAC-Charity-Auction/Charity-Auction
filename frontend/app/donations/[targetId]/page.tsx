// app/donations/[targetId]/page.tsx
import Link from "next/link";
import { Suspense } from "react";
import { body } from "../fonts";
import generateMetadata from "./generateMetadata";
import LoadingState from "./LoadingState";
import styles from "./page.module.css";
import TargetContent from "./TargetContent";

// 기부처 이름과 설명(첫 문단)이 탭 제목과 공유 미리보기에 나와요.
export { generateMetadata };

export default function TargetPage({
	params
}: {
	params: Promise<{ targetId: string }>;
}) {
	return (
		<div className={`${styles.page} ${body.className}`}>
			<main id="main-content" tabIndex={-1} className={styles.wrap}>
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
