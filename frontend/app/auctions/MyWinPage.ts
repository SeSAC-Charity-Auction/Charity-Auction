import MyWin from "./MyWin";

type MyWinPage = {
	items: MyWin[]; // 낙찰이 최근인 순
	page: number; // 0부터 시작
	size: number;
	totalElements: number;
	totalPages: number;
	totalPoints: number; // 지금까지 낙찰로 받은 포인트 합계
};

export default MyWinPage;
