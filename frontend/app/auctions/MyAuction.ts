import AuctionSummary from "./AuctionSummary";

// 내가 올린 경매 한 건: 목록의 한 칸과 같은 값에, 판매자로서 받은 포인트가 더해져요.
type MyAuction = AuctionSummary & {
	pointAmount: number; // 낙찰되어 받은 판매 포인트 (아직이면 0)
};

export default MyAuction;
