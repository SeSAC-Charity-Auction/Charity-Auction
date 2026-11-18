import AuctionSummary from "./AuctionSummary";

type AuctionPage = {
	content: AuctionSummary[];
	number: number; // 0부터 시작
	size: number;
	totalElements: number;
	totalPages: number;
};

export default AuctionPage;
