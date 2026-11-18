"use client";

// 경매가 끝나는 순간과 낙찰 과정을 화면에 반영해요. (화면에는 아무것도 그리지 않아요)
// 백엔드는 마감·낙찰 상태 변화를 웹소켓으로 보내지 않아서, 필요할 때만 서버에 다시 물어봐요.
//  - 진행 중: 마감 시각이 되면 상태가 바뀔 때까지 5초마다 새로 그려요. (마감 스케줄러가 10초마다 돌아요)
//  - 마감(CLOSED, 낙찰자 정하는 중): 10초마다 새로 그려요. 앞 순위가 포기·만료하면 내게 기회가 올 수 있어요.

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AuctionStatus from "../AuctionStatus";

const AFTER_END_MS = 5_000;
const WHILE_CLOSED_MS = 10_000;

export default function StatusWatcher({
	status,
	endAt
}: {
	status: AuctionStatus;
	endAt: string;
}) {
	const router = useRouter();
	useEffect(() => {
		let timer: number | undefined;
		const repeat = (ms: number) => {
			timer = window.setInterval(() => {
				// 탭이 안 보일 때는 묻지 않아요.
				if (document.visibilityState === "visible") router.refresh();
			}, ms);
		};
		if (status === "IN_PROGRESS") {
			const untilEnd = new Date(endAt).getTime() - Date.now();
			// setTimeout은 약 24일보다 긴 시간을 넣으면 바로 실행돼요. 그렇게 먼 마감은 기다리지 않아요.
			if (untilEnd > 2_000_000_000) return;
			const start = window.setTimeout(
				() => {
					router.refresh();
					repeat(AFTER_END_MS);
				},
				Math.max(0, untilEnd) + 1_000
			);
			return () => {
				window.clearTimeout(start);
				window.clearInterval(timer);
			};
		}
		if (status === "CLOSED") {
			repeat(WHILE_CLOSED_MS);
			return () => window.clearInterval(timer);
		}
	}, [status, endAt, router]);
	return null;
}
