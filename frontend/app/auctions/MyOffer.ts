// 내가 지금 받은 낙찰 기회 (auction_candidates에서 status가 OFFERED인 내 후보)
type MyOffer = {
	candidateId: number; // candidate_id
	auctionId: number;
	title: string;
	bidPrice: number; // 내 최고 입찰가 = 낙찰가
	deadlineAtIso: string | null; // 낙찰 기한 (ISO 8601)
};

export default MyOffer;
