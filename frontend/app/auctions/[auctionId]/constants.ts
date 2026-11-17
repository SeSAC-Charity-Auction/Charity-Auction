import AuctionImageState from "../AuctionImageState";

export const STATUS_LABEL = {
	SCHEDULED: "예정",
	IN_PROGRESS: "진행 중",
	CANCELED: "취소"
};

export const CLOSED_NOTE = {
	CLOSED: "낙찰자를 정하는 중이에요",
	COMPLETED: "낙찰 완료",
	FAILED: "유찰",
	IN_PROGRESS: "마감 처리 중이에요"
};

export const idle: AuctionImageState = { status: "idle" };
