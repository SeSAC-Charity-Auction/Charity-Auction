"use client";

// 경매 목록에서 경매 상태가 바뀌면 목록을 새로 그려요. (화면에는 아무것도 그리지 않아요)
// 백엔드가 시작·마감·유찰·낙찰 완료를 /topic/auctions/status 로 알려줘요.
//  - 다음 변경 시각(nextChangeAt)이 되면 한 번 새로 그려요. 마감은 스케줄러를 기다리지 않고 바로 반영돼요.
//  - 웹소켓이 끊겨 있는 동안에만 예전처럼 주기적으로 서버에 물어봐요.
//  - 다시 연결되면 끊긴 사이에 놓친 변화가 있을 수 있어서 한 번 새로 그려요.

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef } from "react";
import useStompTopic from "../realtime/useStompTopic";

const FALLBACK_MS = 10_000; // 연결이 끊겼을 때 물어보는 주기
const MAX_WAIT_MS = 2_000_000_000; // setTimeout 한계(약 24일)

export default function ListStatusWatcher({
	nextChangeAt
}: {
	nextChangeAt: string | null; // ISO 8601, 없으면 기다리지 않아요
}) {
	const router = useRouter();

	// 경매 여러 개가 한꺼번에 시작·마감돼서 메시지가 몰려와도 한 번만 새로 그려요.
	const pending = useRef<number | null>(null);
	const refreshSoon = useCallback(() => {
		if (pending.current !== null) return;
		pending.current = window.setTimeout(() => {
			pending.current = null;
			router.refresh();
		}, 500);
	}, [router]);
	useEffect(
		() => () => {
			if (pending.current !== null) window.clearTimeout(pending.current);
		},
		[]
	);

	const socket = useStompTopic("/topic/auctions/status", refreshSoon);

	// 다음 변경 시각이 되면 한 번 새로 그려요.
	useEffect(() => {
		if (!nextChangeAt) return;
		const wait = new Date(nextChangeAt).getTime() - Date.now();
		if (wait < 0 || wait > MAX_WAIT_MS) return;
		const id = window.setTimeout(() => router.refresh(), wait + 1_000);
		return () => window.clearTimeout(id);
	}, [nextChangeAt, router]);

	// 끊겨 있는 동안에만 주기적으로 물어봐요.
	useEffect(() => {
		if (socket === "open") return;
		const id = window.setInterval(() => {
			if (document.visibilityState === "visible") router.refresh();
		}, FALLBACK_MS);
		return () => window.clearInterval(id);
	}, [socket, router]);

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
