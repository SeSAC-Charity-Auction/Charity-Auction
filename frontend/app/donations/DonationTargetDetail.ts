import DonationRecord from "./DonationRecord";
import DonationTarget from "./DonationTarget";

type DonationTargetDetail = {
	target: DonationTarget;
	donorCount: number; // 이 기부처에 기부한 사람 수 (user_id 중복 제거)
	donationCount: number; // 이 기부처에 기부한 횟수
	recentDonations: DonationRecord[]; // 이 기부처의 최근 기부 (최신순)
};

export default DonationTargetDetail;
