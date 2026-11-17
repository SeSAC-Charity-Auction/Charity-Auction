import DonationRecord from "./DonationRecord";

type DonationPage = {
	items: DonationRecord[]; // 최신순
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
};

export default DonationPage;
