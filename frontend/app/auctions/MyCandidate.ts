// 내 낙찰 후보 한 건 (auction_candidates). 백엔드: MyOfferedCandidateResponse
export type CandidateStatus =
	| "WAITING" // 순번 대기 (앞 순위가 포기·만료하면 기회가 와요)
	| "OFFERED" // 낙찰 기회를 받아 선택을 기다리는 중
	| "COMPLETED" // 수락해서 낙찰 완료
	| "EXPIRED" // 기한 안에 선택하지 않아 넘어감
	| "REJECTED" // 포기함
	| "NOT_SELECTED"; // 다른 사람이 낙찰받아 기회가 끝남

type MyCandidate = {
	candidateId: number;
	auctionId: number;
	title: string;
	image: string | null;
	bidPrice: number; // 내 최고 입찰가 (낙찰되면 이 금액이 낙찰가)
	candidateRank: number; // 몇 순위인지 (1부터)
	status: CandidateStatus;
	deadlineAtIso: string | null; // 낙찰 기한 (ISO 8601). 기회를 받은 뒤에만 있어요
	processedAtIso: string | null; // 수락·포기·만료 등 처리된 시각 (ISO 8601)
};

export default MyCandidate;
