// 서버가 UTC로 준 시각을 한국 시간으로 보여줘요. (예: 2026년 11월 18일 오후 3:20)
export default function formatDateTime(iso: string) {
	return new Date(iso).toLocaleString("ko-KR", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "long",
		day: "numeric",
		hour: "numeric",
		minute: "2-digit"
	});
}
