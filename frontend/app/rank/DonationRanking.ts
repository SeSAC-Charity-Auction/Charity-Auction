export default interface DonationRanking {
	rank: number;
	userId: number;
	nickname: string;
	userImage: string | null;
	totalDonation: number;
	donationCount: number;
}
