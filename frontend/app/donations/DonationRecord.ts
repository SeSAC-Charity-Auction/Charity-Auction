type DonationRecord = {
	donationId: number; // donation_id
	targetId: number; // target_id
	targetName: string; // donation_targets.target_name (JOIN)
	donorName: string; // 회원 이름을 서버에서 마스킹한 값 (예: 김**)
	donationAmount: number; // donation_amount
	createdAt: string; // created_at (ISO 8601)
};

export default DonationRecord;
