import styles from "./page.module.css";

// 목록 한 줄에 들어가는 작은 이미지예요. 이미지가 없으면 제목 첫 글자를 보여줘요.
export default function Thumb({
	image,
	title
}: {
	image: string | null;
	title: string;
}) {
	return (
		<span className={styles.rowThumb}>
			{image ?
				// 외부 주소의 이미지는 next/image 설정(허용 도메인)이 필요해서 일반 img를 썼어요.
				// eslint-disable-next-line @next/next/no-img-element
				<img src={image} alt="" loading="lazy" className={styles.rowThumbImg} />
			:	<span aria-hidden="true">{title.slice(0, 1)}</span>}
		</span>
	);
}
