"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import withdrawMe from "../donations/WithdrawMe";
import WithdrawState from "./WithdrawState";

export default async function withdrawAction(): Promise<WithdrawState> {
	const result = await withdrawMe();
	// 이미 탈퇴했거나 로그인이 풀린 경우에도 결과는 같아서 로그아웃 처리해요.
	if (!result.ok && result.code !== "NOT_LOGGED_IN") {
		return {
			status: "error",
			message: "탈퇴를 처리하지 못했어요. 잠시 뒤에 다시 시도해 주세요."
		};
	}
	(await cookies()).delete("accessToken"); // 로그인 정보를 지워요
	revalidatePath("/", "layout");
	redirect("/donations"); // 성공하면 기부 현황으로 돌아가요
}
