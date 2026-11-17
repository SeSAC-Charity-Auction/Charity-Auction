// 검색창 추천용이에요. 브라우저는 백엔드 주소를 몰라서 서버가 대신 물어봐 줘요.
export async function GET(request: Request) {
	const q = (new URL(request.url).searchParams.get("q") ?? "")
		.trim()
		.slice(0, 50);
	if (!q) return Response.json([]);
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auctions?${new URLSearchParams({
				keyword: q,
				size: "30",
				page: "0",
				sort: "ending"
			})}`,
			{ cache: "no-store" }
		);
		if (!res.ok) return Response.json([]);
		const data: { items: { title: string }[] } = await res.json();
		// 같은 이름은 한 번만, 입력한 글자로 시작하는 이름을 앞에 둬요.
		const lower = q.toLowerCase();
		const titles = [...new Set(data.items.map((a) => a.title))];
		titles.sort(
			(a, b) =>
				Number(b.toLowerCase().startsWith(lower)) -
				Number(a.toLowerCase().startsWith(lower))
		);
		return Response.json(titles.slice(0, 8));
	} catch {
		return Response.json([]);
	}
}
