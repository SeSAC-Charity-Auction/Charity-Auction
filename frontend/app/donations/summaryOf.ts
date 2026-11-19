// 기부처 설명의 첫 문단(한두 문장 요약)이에요. 목록 카드와 검색 결과 설명에 써요.
// 자세한 설명은 상세 페이지에서 전체가 보여요.
export default function summaryOf(description: string | null | undefined) {
	return (description ?? "").trim().split(/\n\s*\n/)[0].replace(/\s+/g, " ");
}
