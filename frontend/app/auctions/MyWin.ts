// 내가 낙찰받은 경매 한 건과, 그 낙찰로 받은 포인트
type MyWin = {
	auctionId: number;
	title: string;
	image: string | null;
	categoryName: string;
	bidPrice: number; // 낙찰가
	wonAt: string | null; // 낙찰이 확정된 시각 (ISO 8601)
	pointAmount: number; // 이 낙찰로 받은 포인트
};

export default MyWin;
