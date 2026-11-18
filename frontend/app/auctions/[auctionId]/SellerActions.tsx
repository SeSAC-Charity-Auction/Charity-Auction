import Link from "next/link";
import { Suspense } from "react";
import isLoggedIn from "../../auth/isLoggedIn";
import getMyProfile from "../../donations/getMyProfile";
import editability from "../item/editability";
import getAuctionForEdit from "../item/getAuctionForEdit";
import styles from "./SellerActions.module.css";

async function SellerActionsContent({ auctionId }: { auctionId: number }) {
	if (!(await isLoggedIn())) return null;
	const [result, me] = await Promise.all([
		getAuctionForEdit(auctionId),
		getMyProfile().catch(() => null)
	]);
	if (result.kind !== "ok" || !me || result.auction.userId !== me.userId) return null;

	const check = editability(result.auction);
	return (
		<div className={styles.box}>
			<p className={styles.title}>내가 등록한 경매예요</p>
			{check.editable ?
				<>
					<p className={styles.text}>
						시작 전이고 입찰이 없어서 내용을 고칠 수 있어요.
					</p>
					<Link href={`/auctions/${auctionId}/edit`} className={styles.button}>
						물품 정보 수정
					</Link>
				</>
			:	<p className={styles.text}>{check.reason}</p>}
		</div>
	);
}

export default function SellerActions({ auctionId }: { auctionId: number }) {
	return (
		<Suspense fallback={null}>
			<SellerActionsContent auctionId={auctionId} />
		</Suspense>
	);
}
