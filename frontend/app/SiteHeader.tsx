import Link from "next/link";
import { Suspense } from "react";
import MyPageLink from "./MyPageLink";
import MyPageNav from "./MyPageNav";
import NavMenu from "./NavMenu";
import styles from "./SiteHeader.module.css";

function PlainMenu() {
	return (
		<>
			<Link href="/" className={styles.link}>
				경매
			</Link>
			<Link href="/donations" className={styles.link}>
				기부
			</Link>
			<Link href="/mypage" className={styles.link}>
				마이페이지
			</Link>
		</>
	);
}

// 모든 페이지 위쪽에 들어가는 메뉴예요. 루트 레이아웃에 한 번만 두어서,
// 메뉴를 옮겨 다녀도 다시 그려지지 않고(프로필 사진이 깜빡이지 않고) 그대로 남아 있어요.
export default function SiteHeader() {
	return (
		<header className={styles.header}>
			<div className={styles.inner}>
				<Link href="/" className={styles.brand}>
					가치잇다
				</Link>
				<nav aria-label="주요 메뉴" className={styles.nav}>
					{/* 지금 주소를 알아야 하는 메뉴라서, 주소를 알기 전에는 강조 없이 먼저 보여줘요. */}
					<Suspense fallback={<PlainMenu />}>
						<NavMenu />
						{/* 로그인한 사람마다 다른 값(프로필 사진)이라 따로 <Suspense>로 감싸요. 늦어져도 나머지 메뉴는 먼저 보여요. */}
						<Suspense fallback={<MyPageNav image={null} />}>
							<MyPageLink />
						</Suspense>
					</Suspense>
				</nav>
			</div>
		</header>
	);
}
