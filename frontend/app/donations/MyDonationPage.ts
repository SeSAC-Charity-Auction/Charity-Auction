import MyDonation from "./MyDonation";

type MyDonationPage = {
	items: MyDonation[]; // 최근 기부가 먼저
	page: number; // 0부터 시작
	size: number;
	totalElements: number;
	totalPages: number;
	totalAmount: number; // 지금까지 기부한 포인트 합계
};

export default MyDonationPage;
