"use client";

import { useEffect, useState } from "react";

// 1초마다 바뀌는 현재 시각(ms)이에요. 처음 값은 서버가 그린 시각을 받아서
// 서버와 브라우저가 처음 그린 화면이 같게 하고, 그 뒤부터 실제 시간을 따라가요.
export default function useNow(initial: number) {
	const [now, setNow] = useState(initial);
	useEffect(() => {
		const id = window.setInterval(() => setNow(Date.now()), 1000);
		return () => window.clearInterval(id);
	}, []);
	return now;
}
