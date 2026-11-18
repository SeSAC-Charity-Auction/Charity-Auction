// 남은 시간을 짧게 말해줘요. 1시간 안으로 남으면 초까지 보여줘서 시간이 흐르는 게 보여요.
export default function span(ms: number) {
	const sec = Math.max(1, Math.ceil(ms / 1000));
	if (sec < 60) return `${sec}초`;
	if (sec < 3600) return `${Math.floor(sec / 60)}분 ${sec % 60}초`;
	const min = Math.floor(sec / 60);
	const hour = Math.floor(min / 60);
	if (hour < 24) return `${hour}시간 ${min % 60}분`;
	return `${Math.floor(hour / 24)}일 ${hour % 24}시간`;
}
