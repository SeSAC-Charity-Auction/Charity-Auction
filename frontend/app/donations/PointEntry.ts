type PointEntry = {
	pointId: number; // point_id
	pointType: "적립" | "사용"; // point_type
	pointAmount: number; // point_amount (크기만 쓰고, 더할지 뺄지는 pointType으로 정해요)
	description: string; // auction_id / donation_id를 보고 서버가 만든 문구
	createdAt: string; // created_at (ISO 8601)
};

export default PointEntry;
