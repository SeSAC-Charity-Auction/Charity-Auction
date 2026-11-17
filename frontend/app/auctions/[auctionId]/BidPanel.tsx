import { won } from "../../donations/format";
import AuctionDetail from "../AuctionDetail";
import isPast from "../isPast";
import BidForm from "./BidForm";
import styles from "./page.module.css";

// 경매 상태에 따라 입찰 폼 또는 안내 문구를 보여줘요.
export default function BidPanel({ auction }: { auction: AuctionDetail }) {
	const ended = isPast(auction.endAt);

	if (auction.status === "IN_PROGRESS" && !ended) {
		return (
			<BidForm
				auctionId={auction.auctionId}
				currentPrice={auction.currentPrice}
				hasBids={auction.bidCount > 0}
			/>
		);
	}

	let title = "입찰할 수 없어요";
	let text = "이 경매는 지금 입찰을 받지 않아요.";
	switch (auction.status) {
		case "SCHEDULED":
			title = "아직 시작 전이에요";
			text = "경매가 시작되면 이곳에서 입찰할 수 있어요.";
			break;
		case "IN_PROGRESS":
			title = "마감 처리 중이에요";
			text = "경매 시간이 끝나서 곧 결과가 정해져요.";
			break;
		case "CLOSED":
			title = "경매가 끝났어요";
			text = "낙찰 결과를 정하고 있어요.";
			break;
		case "COMPLETED":
			title = "낙찰이 끝났어요";
			text =
				auction.winner ?
					`${auction.winner.nickname}님이 ${won(auction.winner.bidPrice)}에 낙찰받았어요.`
				:	"낙찰이 완료된 경매예요.";
			break;
		case "FAILED":
			title = "유찰됐어요";
			text = "입찰한 사람이 없어서 낙찰되지 않았어요.";
			break;
		case "CANCELED":
			title = "취소된 경매예요";
			text = "판매자가 이 경매를 취소했어요.";
			break;
	}

	return (
		<div className={styles.quiet}>
			<h2 className={styles.quietTitle}>{title}</h2>
			<p className={styles.quietText}>{text}</p>
		</div>
	);
}
