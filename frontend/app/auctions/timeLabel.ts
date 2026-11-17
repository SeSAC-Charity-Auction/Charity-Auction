import AuctionSummary from "./AuctionSummary";
import span from "./span";

// 진행 중이면 남은 시간, 예정이면 시작까지 남은 시간을 문장으로 만들어요.
export default function timeLabel(
	a: Pick<AuctionSummary, "startAt" | "endAt" | "status">
) {
	const now = Date.now();
	if (a.status !== "SCHEDULED" && a.status !== "IN_PROGRESS") {
		return { text: "마감됐어요", urgent: false };
	}
	const start = new Date(a.startAt).getTime();
	const end = new Date(a.endAt).getTime();
	if (a.status === "SCHEDULED") {
		return { text: `${span(start - now)} 뒤 시작`, urgent: false };
	}
	const left = end - now;
	if (left <= 0) return { text: "마감됐어요", urgent: false };
	return { text: `${span(left)} 남음`, urgent: left < 3_600_000 };
}
