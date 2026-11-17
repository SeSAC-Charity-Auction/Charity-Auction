export default function joinedDate(iso: string) {
	return new Date(iso).toLocaleDateString("ko-KR", {
		timeZone: "Asia/Seoul",
		year: "numeric",
		month: "long",
		day: "numeric"
	});
}
