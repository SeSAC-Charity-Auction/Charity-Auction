import AuctionStatus from "./AuctionStatus";
import isPast from "./isPast";
import { StatusTone } from "./StatusTone";

// 내 경매 목록에서 보여줄 상태 이름이에요.
export default function statusLabel(a: {
	status: AuctionStatus;
	endAt: string;
}): { text: string; tone: StatusTone } {
	switch (a.status) {
		case "SCHEDULED":
			return { text: "예정", tone: "soon" };
		case "IN_PROGRESS":
			return isPast(a.endAt) ?
					{ text: "마감", tone: "closed" }
				:	{ text: "진행 중", tone: "live" };
		case "CLOSED":
			return { text: "낙찰자 선정 중", tone: "closed" };
		case "COMPLETED":
			return { text: "낙찰 완료", tone: "closed" };
		case "FAILED":
			return { text: "유찰", tone: "closed" };
		case "CANCELED":
			return { text: "취소", tone: "closed" };
	}
}
