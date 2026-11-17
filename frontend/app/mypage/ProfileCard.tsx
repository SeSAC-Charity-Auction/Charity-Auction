import Link from "next/link";
import { display } from "../donations/fonts";
import MyProfile from "../donations/MyProfile";
import AvatarUploader from "./AvatarUploader";
import joinedDate from "./joinedDate";
import NicknameEditor from "./NicknameEditor";
import styles from "./page.module.css";

export default function ProfileCard({ profile }: { profile: MyProfile }) {
	return (
		<section className={styles.profile} aria-label="내 정보">
			<AvatarUploader nickname={profile.nickname}>
				{
					profile.userImage ?
						// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
						// eslint-disable-next-line @next/next/no-img-element
						<img
							src={profile.userImage}
							alt={`${profile.nickname} 프로필 이미지`}
							className={styles.avatarImg}
						/>
						// 이미지가 없으면 닉네임의 첫 글자를 보여줘요.
					:	<span
							className={`${styles.avatarFallback} ${display.className}`}
							aria-hidden="true"
						>
							{profile.nickname.slice(0, 1)}
						</span>

				}
			</AvatarUploader>
			<div className={styles.profileInfo}>
				<NicknameEditor
					nickname={profile.nickname}
					displayClassName={display.className}
				/>
				<p className={styles.realName}>{profile.name}</p>
				<dl className={styles.facts}>
					<div className={styles.fact}>
						<dt>이메일</dt>
						<dd>{profile.email}</dd>
					</div>
					<div className={styles.fact}>
						<dt>가입일</dt>
						<dd>{joinedDate(profile.createdAt)}</dd>
					</div>
				</dl>
			</div>
			<Link
				href="/donations#targets"
				className={`${styles.btn} ${styles.btnPrimary}`}
			>
				기부하러 가기
			</Link>
		</section>
	);
}
