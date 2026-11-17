import MyPoints from "./MyPoints";
import signedAmount from "./signedAmount";

export default function balanceSeries(points: MyPoints) {
	const oldestFirst = [...points.recent].reverse();
	const total = oldestFirst.reduce((sum, e) => sum + signedAmount(e), 0);
	let running = points.balance - total; // 가장 오래된 내역 직전의 잔액
	const series = [running];
	for (const e of oldestFirst) {
		running += signedAmount(e);
		series.push(running);
	}
	return series;
}
