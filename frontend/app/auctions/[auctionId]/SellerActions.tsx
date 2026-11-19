import Link from "next/link";
import { Suspense } from "react";
import isLoggedIn from "../../auth/isLoggedIn";
import getMyProfile from "../../donations/getMyProfile";
import editability from "../item/editability";
import getAuctionForEdit from "../item/getAuctionForEdit";
import DeleteAuctionButton from "./DeleteAuctionButton";
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
						시작 전이고 입찰이 없어서 내용을 고치거나 삭제할 수 있어요.
					</p>
					{/* 삭제도 수정과 같은 조건(시작 전, 입찰 없음)이라 함께 보여줘요. (백엔드 Auction.delete와 같은 규칙) */}
					<div className={styles.actions}>
						<Link href={`/auctions/${auctionId}/edit`} className={styles.button}>
							물품 정보 수정
						</Link>
						<DeleteAuctionButton
							auctionId={auctionId}
							title={result.auction.title}
						/>
					</div>
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
