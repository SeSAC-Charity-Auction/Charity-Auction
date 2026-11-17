import AuctionSummary from "./AuctionSummary";

function span(ms: number) {
	const min = Math.max(1, Math.floor(ms / 60_000));
	if (min < 60) return `${min}분`;
	const hour = Math.floor(min / 60);
	if (hour < 24) return `${hour}시간 ${min % 60}분`;
	const day = Math.floor(hour / 24);
	return `${day}일 ${hour % 24}시간`;
}

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
