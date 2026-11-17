import MyAuction from "./MyAuction";

type MyAuctionPage = {
	items: MyAuction[]; // 최신 등록순
	page: number; // 0부터 시작
	size: number;
	totalElements: number;
	totalPages: number;
	totalPoints: number; // 지금까지 내 경매가 낙찰되어 받은 판매 포인트 합계
};

export default MyAuctionPage;
