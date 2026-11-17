"use server";

import { revalidatePath } from "next/cache";
import markPointsSeen from "../donations/markPointsSeen";

// 내 포인트를 봤다고 기록해요. 붉은 점이 있었다면 위쪽 메뉴를 다시 그려서 없애요.
export default async function markPointsSeenAction() {
	if (await markPointsSeen()) {
		revalidatePath("/", "layout");
	}
}
