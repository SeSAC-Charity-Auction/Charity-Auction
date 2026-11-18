// 이 시각이 이미 지났는지 알려줘요.
export default function isPast(iso: string, now: number = Date.now()) {
	return new Date(iso).getTime() <= now;
}
