// 경매 상세 화면이 받는 실시간 입찰 메시지예요.
// 백엔드: BidRealtimeResponse → /topic/auctions/{auctionId}
type BidRealtimeMessage = {
	bidId: number;
	auctionId: number;
	nickname: string;
	bidPrice: number;
	bidAt: string; // ISO 8601
	currentPrice: number;
	bidCount: number;
};

export default BidRealtimeMessage;
