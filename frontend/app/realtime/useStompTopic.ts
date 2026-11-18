"use client";

import { useEffect, useRef, useSyncExternalStore } from "react";
import {
	getStatus,
	onStatusChange,
	subscribe,
	type SocketStatus
} from "./stompClient";

/**
 * 웹소켓 주소(topic)를 구독하고, 메시지가 오면 onMessage를 불러요.
 * 연결 상태("connecting" | "open" | "reconnecting" | "closed")를 돌려줘요.
 */
export default function useStompTopic<T>(
	topic: string | null,
	onMessage: (body: T) => void
): SocketStatus {
	// 매번 새로 만들어지는 함수여도 구독을 다시 걸지 않도록 ref에 담아 둬요.
	const handler = useRef(onMessage);
	useEffect(() => {
		handler.current = onMessage;
	});
	useEffect(() => {
		if (!topic) return;
		return subscribe(topic, (body) => handler.current(body as T));
	}, [topic]);
	return useSyncExternalStore(onStatusChange, getStatus, () => "closed");
}
