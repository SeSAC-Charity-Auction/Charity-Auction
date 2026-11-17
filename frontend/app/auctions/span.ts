export default function span(ms: number) {
	const min = Math.max(1, Math.floor(ms / 60_000));
	if (min < 60) return `${min}분`;
	const hour = Math.floor(min / 60);
	if (hour < 24) return `${hour}시간 ${min % 60}분`;
	const day = Math.floor(hour / 24);
	return `${day}일 ${hour % 24}시간`;
}
