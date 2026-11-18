"use client";

// 경매 상태가 바뀌면 화면을 새로 그려요. (화면에는 아무것도 그리지 않아요)
// 백엔드가 시작·마감·유찰·낙찰 완료·다음 순위로 기회 넘김을 /topic/auctions/{id}/status 로 알려줘요.
// 메시지는 "바뀌었다"는 신호로만 쓰고, 실제 값(내 낙찰 기회 등)은 새로 그리면서 서버에서 다시 가져와요.
//  - 시작·마감 시각이 되면 한 번 새로 그려요. (스케줄러를 기다리지 않고 "마감 처리 중" 등을 바로 보여줘요)
//  - 웹소켓이 끊겨 있는 동안에만 예전처럼 주기적으로 서버에 물어봐요.
//  - 다시 연결되면 끊긴 사이에 놓친 변화가 있을 수 있어서 한 번 새로 그려요.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import useStompTopic from "../../realtime/useStompTopic";
import AuctionStatus from "../AuctionStatus";

const FALLBACK_MS = 10_000; // 연결이 끊겼을 때 물어보는 주기
const MAX_WAIT_MS = 2_000_000_000; // setTimeout 한계(약 24일)

export default function StatusWatcher({
	auctionId,
	status,
	startAt,
	endAt
}: {
	auctionId: number;
	status: AuctionStatus;
	startAt: string;
	endAt: string;
}) {
	const router = useRouter();

	// 메시지가 짧은 간격으로 여러 개 와도 한 번만 새로 그려요.
	const pending = useRef<number | null>(null);
	const refreshSoon = useCallback(() => {
		if (pending.current !== null) return;
		pending.current = window.setTimeout(() => {
			pending.current = null;
			router.refresh();
		}, 300);
	}, [router]);
	useEffect(
		() => () => {
			if (pending.current !== null) window.clearTimeout(pending.current);
		},
		[]
	);

	const socket = useStompTopic(`/topic/auctions/${auctionId}/status`, refreshSoon);

	// 시작·마감 시각이 되면 한 번 새로 그려요.
	useEffect(() => {
		const iso =
			status === "SCHEDULED" ? startAt
			: status === "IN_PROGRESS" ? endAt
			: null;
		if (!iso) return;
		const wait = new Date(iso).getTime() - Date.now();
		if (wait < 0 || wait > MAX_WAIT_MS) return;
		const id = window.setTimeout(() => router.refresh(), wait + 1_000);
		return () => window.clearTimeout(id);
	}, [status, startAt, endAt, router]);

	// 끊겨 있는 동안에만 주기적으로 물어봐요. (끝난 경매는 더 바뀔 게 없어서 묻지 않아요)
	const settled = status === "COMPLETED" || status === "FAILED" || status === "CANCELED";
	useEffect(() => {
		if (socket === "open" || settled) return;
		const id = window.setInterval(() => {
			if (document.visibilityState === "visible") router.refresh();
		}, FALLBACK_MS);
		return () => window.clearInterval(id);
	}, [socket, settled, router]);

	// 끊겼다가 다시 연결되면 한 번 새로 그려요.
	const wasReconnecting = useRef(false);
	useEffect(() => {
		if (socket === "reconnecting") wasReconnecting.current = true;
		if (socket === "open" && wasReconnecting.current) {
			wasReconnecting.current = false;
			refreshSoon();
		}
	}, [socket, refreshSoon]);

	return null;
}
