// app/donations/format.ts
// 금액과 시간을 화면에 보여줄 모양으로 바꾸는 도우미들이에요.

export const won = (n: number) => `${n.toLocaleString("ko-KR")}원`;

export function relativeTime(iso: string) {
	const diffSec = Math.round((new Date(iso).getTime() - Date.now()) / 1000);
	const abs = Math.abs(diffSec);
	if (abs < 60) return "방금 전";
	const rtf = new Intl.RelativeTimeFormat("ko", { numeric: "auto" });
	if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
	if (abs < 86_400) return rtf.format(Math.round(diffSec / 3600), "hour");
	return rtf.format(Math.round(diffSec / 86_400), "day");
}
