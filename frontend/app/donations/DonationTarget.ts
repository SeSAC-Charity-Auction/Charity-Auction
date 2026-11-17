type DonationTarget = {
	targetId: number; // target_id
	targetName: string; // target_name
	description: string | null; // description (NULL 가능)
	targetImage: string | null; // target_image (NULL 가능, 이미지 주소)
	isActive: boolean; // is_active (기부 가능 여부)
	isAchieved: boolean; // is_achieved (목표 기부금 달성 여부)
	totalDonation: number; // total_donation (누적 기부금)
	targetAmount: number; // target_amount (목표 기부금)
	createdAt: string; // created_at (ISO 8601)
};

export default DonationTarget;
