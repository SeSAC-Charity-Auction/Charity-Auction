// 경매 목록 화면이 받는 실시간 가격 메시지예요.
// 백엔드: AuctionPriceUpdateResponse → /topic/auctions
type AuctionPriceUpdateMessage = {
	auctionId: number;
	currentPrice: number;
	bidCount: number;
};

export default AuctionPriceUpdateMessage;
