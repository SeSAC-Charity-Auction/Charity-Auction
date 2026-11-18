import Link from "next/link";
import { connection } from "next/server";
import getDonationRanking from "./getDonationRanking";
import RankAvatar from "./RankAvatar";
import styles from "./page.module.css";

export default async function RankingContent() {
	await connection();
	const rankings = await getDonationRanking();

	if (rankings === null) {
		return (
			<div className={styles.state} role="status">
				<h2>랭킹을 불러오지 못했어요</h2>
				<p>잠시 후 다시 시도해 주세요.</p>
				<form action="/rank" method="get">
					<button type="submit" className={styles.button}>다시 불러오기</button>
				</form>
			</div>
		);
	}

	if (rankings.length === 0) {
		return (
			<div className={styles.state}>
				<h2>아직 기부 랭킹이 없어요</h2>
				<p>첫 기부가 모이면 이곳에 랭킹이 표시돼요.</p>
				<Link href="/donations" className={styles.button}>기부처 둘러보기</Link>
			</div>
		);
	}

	return (
		<section aria-labelledby="ranking-list-title" className={styles.panel}>
			<div className={styles.listHead}>
				<h2 id="ranking-list-title">실시간 누적 기부 순위</h2>
				<p>기부에 참여한 <strong>{rankings.length.toLocaleString("ko-KR")}명</strong></p>
			</div>
			<table className={styles.table}>
				<caption className="sr-only">회원별 누적 기부 포인트 순위</caption>
				<thead>
					<tr><th scope="col">순위</th><th scope="col">회원</th><th scope="col">누적 기부</th></tr>
				</thead>
				<tbody>
					{rankings.map((member) => (
						<tr key={member.userId}>
							<th scope="row">
								<span className={`${styles.rank} ${member.rank <= 3 ? styles.topRank : ""}`}>
									{member.rank.toLocaleString("ko-KR")}<span className="sr-only">위</span>
								</span>
							</th>
							<td>
								<div className={styles.member}>
									<RankAvatar image={member.userImage} nickname={member.nickname} />
									<span className={styles.nickname}>{member.nickname}</span>
								</div>
							</td>
							<td className={styles.amount}>
								{member.totalDonation.toLocaleString("ko-KR")}<span className={styles.unit}> P</span>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</section>
	);
}
