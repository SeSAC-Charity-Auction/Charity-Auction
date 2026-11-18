"use client";

import { useState } from "react";
import styles from "./page.module.css";

export default function RankAvatar({ image, nickname }: { image: string | null; nickname: string }) {
	const [failedImage, setFailedImage] = useState<string | null>(null);
	return (
		<span className={styles.avatar} aria-hidden="true">
			{image && failedImage !== image ? (
				// eslint-disable-next-line @next/next/no-img-element
				<img src={image} alt="" loading="lazy" width={44} height={44}
					ref={(element) => {
						if (element?.complete && element.naturalWidth === 0) setFailedImage(image);
					}}
					onError={() => setFailedImage(image)} />
			) : (
				<span>{Array.from(nickname)[0] || "?"}</span>
			)}
		</span>
	);
}
