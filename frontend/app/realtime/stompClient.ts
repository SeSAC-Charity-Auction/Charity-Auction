"use client";

// 브라우저 탭 하나에 웹소켓(STOMP) 연결을 하나만 열어 두고, 여러 화면이 같이 써요.
// - 구독하는 화면이 하나도 없으면 연결을 닫아요.
// - 연결이 끊기면 3초마다 다시 연결하고, 다시 연결되면 구독도 모두 다시 걸어요.
// 백엔드: WebSocketConfig (엔드포인트 /ws, 브로커 /topic)

import { Client, type StompSubscription } from "@stomp/stompjs";

export type SocketStatus = "connecting" | "open" | "reconnecting" | "closed";

type Listener = (body: unknown) => void;

// 브라우저는 서버 전용 환경변수(API_BASE_URL)를 읽지 못해서, NEXT_PUBLIC_ 이 붙은 값을 따로 써요.
const WS_URL = process.env.NEXT_PUBLIC_WS_URL ?? "ws://localhost:8080/ws";

let client: Client | null = null;
let status: SocketStatus = "closed";
const topics = new Map<string, Set<Listener>>(); // 주소별 듣는 함수들
const subs = new Map<string, StompSubscription>(); // 지금 서버에 걸려 있는 구독
const statusListeners = new Set<(s: SocketStatus) => void>();

function setStatus(next: SocketStatus) {
	status = next;
	statusListeners.forEach((fn) => fn(next));
}

function subscribeOnServer(topic: string) {
	if (!client?.connected || subs.has(topic)) return;
	const sub = client.subscribe(topic, (message) => {
		let body: unknown;
		try {
			body = JSON.parse(message.body);
		} catch {
			return; // JSON이 아니면 무시해요
		}
		topics.get(topic)?.forEach((fn) => fn(body));
	});
	subs.set(topic, sub);
}

function ensureClient() {
	if (client) return;
	client = new Client({
		brokerURL: WS_URL,
		reconnectDelay: 3_000,
		heartbeatIncoming: 10_000,
		heartbeatOutgoing: 10_000,
		onConnect: () => {
			subs.clear(); // 새 연결이라 예전 구독은 사라졌어요
			topics.forEach((_, topic) => subscribeOnServer(topic));
			setStatus("open");
		},
		onWebSocketClose: () => {
			subs.clear();
			// 구독하는 화면이 남아 있으면 곧 다시 연결해요.
			setStatus(topics.size > 0 ? "reconnecting" : "closed");
		},
		onStompError: (frame) => {
			console.error("STOMP 오류:", frame.headers.message, frame.body);
		}
	});
	setStatus("connecting");
	client.activate();
}

function closeIfIdle() {
	if (topics.size > 0 || !client) return;
	const c = client;
	client = null;
	subs.clear();
	void c.deactivate();
	setStatus("closed");
}

/** 주소(topic)를 구독해요. 돌려받은 함수를 부르면 구독을 풀어요. */
export function subscribe(topic: string, listener: Listener): () => void {
	let set = topics.get(topic);
	if (!set) {
		set = new Set();
		topics.set(topic, set);
	}
	set.add(listener);
	ensureClient();
	subscribeOnServer(topic);
	return () => {
		const current = topics.get(topic);
		if (!current) return;
		current.delete(listener);
		if (current.size === 0) {
			topics.delete(topic);
			const sub = subs.get(topic);
			subs.delete(topic);
			if (client?.connected) sub?.unsubscribe();
		}
		// 화면 이동 중 바로 다음 화면이 같은 연결을 쓸 수 있게 조금 기다렸다 닫아요.
		window.setTimeout(closeIfIdle, 1_000);
	};
}

export function getStatus() {
	return status;
}

export function onStatusChange(fn: (s: SocketStatus) => void) {
	statusListeners.add(fn);
	return () => {
		statusListeners.delete(fn);
	};
}
