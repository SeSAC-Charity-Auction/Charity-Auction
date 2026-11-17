import styles from "./page.module.css";

export default function Sparkline({
	values,
	label
}: {
	values: number[];
	label: string;
}) {
	const W = 240;
	const H = 72;
	const PAD = 8;
	const min = Math.min(...values);
	const max = Math.max(...values);
	const span = max - min;
	const points = values.map((v, i) => {
		const x = PAD + (i * (W - PAD * 2)) / Math.max(1, values.length - 1);
		const y =
			span === 0 ? H / 2 : H - PAD - ((v - min) / span) * (H - PAD * 2);
		return [x, y] as const;
	});
	const path = points
		.map(
			([x, y], i) =>
				`${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`
		)
		.join(" ");
	const [lastX, lastY] = points[points.length - 1];
	return (
		<svg
			viewBox={`0 0 ${W} ${H}`}
			role="img"
			aria-label={label}
			className={styles.spark}
		>
			<path d={path} className={styles.sparkLine} />
			<circle cx={lastX} cy={lastY} r={5} className={styles.sparkDot} />
		</svg>
	);
}
