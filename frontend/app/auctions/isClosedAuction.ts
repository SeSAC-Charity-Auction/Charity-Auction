import AuctionStatus from "./AuctionStatus";
import isPast from "./isPast";

// 마감된 경매인지 알려줘요. 마감 처리(CLOSED·COMPLETED·FAILED)가 끝난 경매뿐 아니라,
// 마감 시각이 지났지만 서버가 아직 처리하지 못한 진행 중 경매도 마감으로 봐요.
export default function isClosedAuction(a: {
	status: AuctionStatus;
	endAt: string;
}, now: number = Date.now()) {
	if (a.status === "IN_PROGRESS") return isPast(a.endAt, now);
	return (
		a.status === "CLOSED" ||
		a.status === "COMPLETED" ||
		a.status === "FAILED"
	);
}
