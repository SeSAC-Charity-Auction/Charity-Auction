// 내 기부 이력의 한 줄이에요.
type MyDonation = {
	donationId: number;
	targetId: number;
	targetName: string;
	targetImage: string | null; // 기부처 대표 이미지 (없으면 null)
	donationAmount: number;
	createdAt: string; // ISO 8601
};

export default MyDonation;
