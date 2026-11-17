// auctions.status. 목록에서는 진행 중과 예정만 써요.
type AuctionStatus =
	| "SCHEDULED"
	| "IN_PROGRESS"
	| "CLOSED"
	| "COMPLETED"
	| "FAILED"
	| "CANCELED";

export default AuctionStatus;
