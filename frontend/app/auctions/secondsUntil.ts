// 이 시각까지 몇 초 남았는지 알려줘요. 지났으면 0이에요.
export default function secondsUntil(iso: string) {
	return Math.max(0, Math.ceil((new Date(iso).getTime() - Date.now()) / 1000));
}
