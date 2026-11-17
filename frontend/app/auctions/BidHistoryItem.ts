// 입찰 내역(bids) 한 건. 입찰자는 닉네임으로만 보여요.
type BidHistoryItem = {
	bidId: number; // bid_id
	nickname: string; // 입찰자 닉네임
	bidPrice: number; // bid_price
	bidAt: string; // bid_at (ISO 8601)
};

export default BidHistoryItem;
