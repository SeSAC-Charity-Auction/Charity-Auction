import AuctionSummary from "./AuctionSummary";

type AuctionPage = {
	items: AuctionSummary[];
	page: number; // 0부터 시작
	size: number;
	totalElements: number;
	totalPages: number;
};

export default AuctionPage;
