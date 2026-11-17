import DonationRecord from "./DonationRecord";
import DonationTarget from "./DonationTarget";

type DonationSummary = {
	totalDonation: number; // 전체 기부금 합계
	donationCount: number; // 기부 횟수 (donations 행 수)
	donorCount: number; // 기부한 사람 수 (user_id 중복 제거)
	targets: DonationTarget[]; // 기부처 목록 (비활성 포함, 거르는 건 화면에서)
	recentDonations: DonationRecord[]; // 최신순
};

export default DonationSummary;
