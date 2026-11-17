// 낙찰이 끝난 경매의 낙찰자 (auction_candidates에서 status가 COMPLETED인 후보)
type AuctionWinner = {
	nickname: string;
	bidPrice: number; // 낙찰가
};

export default AuctionWinner;
