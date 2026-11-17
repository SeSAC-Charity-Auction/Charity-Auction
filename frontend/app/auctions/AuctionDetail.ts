import AuctionStatus from "./AuctionStatus";
import AuctionWinner from "./AuctionWinner";
import BidHistoryItem from "./BidHistoryItem";

// 경매 물품 상세 (auctions + 카테고리 + 판매자 닉네임 + 최근 입찰 + 낙찰자)
type AuctionDetail = {
	auctionId: number;
	title: string;
	image: string | null;
	description: string | null;
	categoryId: number;
	categoryName: string;
	sellerNickname: string;
	startPrice: number;
	currentPrice: number; // 입찰 전에는 시작 가격
	bidCount: number;
	startAt: string; // ISO 8601
	endAt: string; // ISO 8601
	status: AuctionStatus;
	winner: AuctionWinner | null; // 낙찰이 끝났을 때만 값이 있어요
	recentBids: BidHistoryItem[]; // 최신순, 최대 10건
};

export default AuctionDetail;
