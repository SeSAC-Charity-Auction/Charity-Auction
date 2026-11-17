type MyProfile = {
	userId: number; // user_id
	email: string; // email
	name: string; // name (실명)
	nickname: string; // nickname
	userImage: string | null; // 프로필 이미지 주소 (없으면 null)
	point: number; // point (지금 기부할 수 있는 포인트)
	createdAt: string; // created_at (가입일시, ISO 8601)
	donationCount: number; // 내가 기부한 횟수
	totalDonation: number; // 내가 기부한 총 포인트
	canEditTargets: boolean; // 기부처 이미지를 고칠 수 있는지 (ADMIN 또는 개발 환경)
};

export default MyProfile;
