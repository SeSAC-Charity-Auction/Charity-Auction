import MyProfile from "../donations/MyProfile";
import Stat from "../donations/Stat";
import styles from "./page.module.css";

export default function Stats({ profile }: { profile: MyProfile }) {
	return (
		<dl className={styles.stats}>
			<Stat
				label="지금 쓸 수 있는 포인트"
				value={profile.point}
				unit="P"
			/>
			<Stat
				label="내가 기부한 횟수"
				value={profile.donationCount}
				unit="번"
			/>
			<Stat
				label="내가 기부한 포인트"
				value={profile.totalDonation}
				unit="P"
			/>
		</dl>
	);
}
