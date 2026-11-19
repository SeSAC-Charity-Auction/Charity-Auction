import MyCandidate from "../auctions/MyCandidate";

// 낙찰 후보 상태를 사람이 읽기 쉬운 말로 바꿔요.
export default function candidateLabel(c: MyCandidate): string {
	switch (c.status) {
		case "WAITING":
			return `${c.candidateRank}순위 대기`;
		case "OFFERED":
			return "선택 대기";
		case "COMPLETED":
			return "낙찰 완료";
		case "REJECTED":
			return "포기";
		case "EXPIRED":
			return "기한 만료";
		case "NOT_SELECTED":
			return "기회 종료";
	}
}

// 상태별로 덧붙이는 짧은 설명이에요.
export function candidateNote(c: MyCandidate): string | null {
	switch (c.status) {
		case "WAITING":
			return "앞 순위가 포기하거나 기한이 지나면 기회가 와요.";
		case "EXPIRED":
			return "기한 안에 선택하지 않아 다음 순위로 넘어갔어요.";
		case "NOT_SELECTED":
			return "다른 분이 낙찰받아 기회가 끝났어요.";
		default:
			return null;
	}
}
