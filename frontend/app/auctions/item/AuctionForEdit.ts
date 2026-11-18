import AuctionStatus from "../AuctionStatus";

type AuctionForEdit = {
	id: number;
	title: string;
	image: string | null;
	description: string | null;
	startPrice: number;
	currentPrice: number;
	bidCount: number;
	startAt: string;
	endAt: string;
	status: AuctionStatus;
	categoryId: number;
	categoryName: string;
	userId: number;
};

export default AuctionForEdit;
