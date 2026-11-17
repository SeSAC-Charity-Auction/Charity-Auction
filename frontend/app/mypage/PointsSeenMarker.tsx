"use client";

// 이 화면이 열리면 "내 포인트를 확인했다"고 서버에 알려요. (화면에는 아무것도 그리지 않아요)

import { useEffect } from "react";
import markPointsSeenAction from "./markPointsSeenAction";

export default function PointsSeenMarker() {
	useEffect(() => {
		void markPointsSeenAction();
	}, []);
	return null;
}
