import AuctionStatus from "./AuctionStatus";

// 경매 물품 목록의 한 칸 (auctions + 카테고리 이름)
type AuctionSummary = {
	auctionId: number; // auction_id
	title: string; // 상품명
	image: string | null; // 상품 이미지 주소 (없으면 null)
	categoryId: number;
	categoryName: string;
	startPrice: number; // 시작 가격
	currentPrice: number; // 현재 입찰가 (입찰 전에는 시작 가격)
	bidCount: number; // 입찰 횟수
	startAt: string; // 경매 시작일 (ISO 8601)
	endAt: string; // 경매 종료일 (ISO 8601)
	status: AuctionStatus;
};

export default AuctionSummary;
