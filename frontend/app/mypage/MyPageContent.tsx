import getMyAuctions from "../auctions/getMyAuctions";
import getMyWins from "../auctions/getMyWins";
import styles from "./page.module.css";
import { connection } from "next/server";
import { display } from "../donations/fonts";
import getMyPoints from "../donations/getMyPoints";
import getMyProfile from "../donations/getMyProfile";
import MyAuctionsSection from "./MyAuctionsSection";
import MyWinsSection from "./MyWinsSection";
import PointSection from "./PointSection";
import ProfileCard from "./ProfileCard";
import SignedOut from "./SignedOut";
import Stats from "./Stats";
import WithdrawSection from "./WithdrawSection";

export default async function MyPageContent() {
	// "여기부터는 요청이 올 때 그린다"는 표시예요. 현재 시각을 쓰는 코드보다 먼저 있어야 해요.
	await connection();
	const [profile, points, myAuctions, myWins] = await Promise.all([
		getMyProfile(),
		getMyPoints(),
		// 경매 정보를 못 불러와도 마이페이지의 나머지는 보이게 해요.
		getMyAuctions(0, 5).catch(() => null),
		getMyWins(0, 5).catch(() => null)
	]);
	if (!profile || !points) return <SignedOut />;
	return (
		<>
			<h1 className={`${styles.pageTitle} ${display.className}`}>
				마이페이지
			</h1>
			<ProfileCard profile={profile} />
			<Stats profile={profile} />
			{myAuctions && <MyAuctionsSection data={myAuctions} />}
			{myWins && <MyWinsSection data={myWins} />}
			<PointSection points={points} balance={profile.point} />
			<WithdrawSection balance={profile.point} />
		</>
	);
}
