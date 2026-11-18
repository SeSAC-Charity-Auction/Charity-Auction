"use client";

// 남은 시간을 1초마다 새로 계산해서 보여줘요. 시작·마감 시각을 지나는 순간에는
// 서버 화면(입찰 폼, 상태 문구)도 바뀌어야 해서 한 번 새로고침해요.
import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import FlipText from "../donations/FlipText";
import AuctionSummary from "./AuctionSummary";
import timeLabel from "./timeLabel";
import useNow from "./useNow";

export default function LiveTimeText({
	auction,
	now: serverNow
}: {
	auction: Pick<AuctionSummary, "startAt" | "endAt" | "status">;
	now: number;
}) {
	const router = useRouter();
	const now = useNow(serverNow);
	const time = timeLabel(auction, now);
	const target = new Date(
		auction.status === "SCHEDULED" ? auction.startAt : auction.endAt
	).getTime();
	const waiting = useRef(target > serverNow);
	const crossed = target <= now;
	useEffect(() => {
		if (crossed && waiting.current) {
			waiting.current = false;
			router.refresh();
		}
	}, [crossed, router]);
	return <FlipText text={time.text} />;
}
