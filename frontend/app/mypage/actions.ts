"use server";

// app/mypage/actions.ts
// 프로필 사진을 올릴 때 서버에서 실행되는 함수예요.

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { changeMyNickname, uploadMyImage, withdrawMe } from "../donations/data";

export type UploadState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string };

const MAX_BYTES = 2 * 1024 * 1024;

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	INVALID_IMAGE: "PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.",
	IMAGE_TOO_LARGE: "이미지는 2MB 이하만 올릴 수 있어요.",
	UNKNOWN: "사진을 올리지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export async function uploadImageAction(
	_prev: UploadState,
	formData: FormData
): Promise<UploadState> {
	const file = formData.get("file");
	if (!(file instanceof File) || file.size === 0) {
		return { status: "error", message: MESSAGES.INVALID_IMAGE };
	}
	if (file.size > MAX_BYTES) {
		return { status: "error", message: MESSAGES.IMAGE_TOO_LARGE };
	}

	const result = await uploadMyImage(file);
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}

	revalidatePath("/mypage"); // 새 사진으로 다시 그려요
	return { status: "success" };
}

/* ---------- 닉네임 바꾸기 ---------- */

export type NicknameState =
	| { status: "idle" }
	| { status: "success"; nickname: string }
	| { status: "error"; message: string };

const NICKNAME_MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: MESSAGES.NOT_LOGGED_IN,
	INVALID_NICKNAME: "닉네임은 2자 이상 10자 이하로 입력해 주세요.",
	DUPLICATE_NICKNAME: "이미 사용 중인 닉네임이에요.",
	UNKNOWN: "닉네임을 바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export async function changeNicknameAction(
	_prev: NicknameState,
	formData: FormData
): Promise<NicknameState> {
	// 화면에서도 검사하지만, 요청은 조작될 수 있어서 서버에서 다시 확인해요.
	const nickname = String(formData.get("nickname") ?? "").trim();
	if (nickname.length < 2 || nickname.length > 10) {
		return { status: "error", message: NICKNAME_MESSAGES.INVALID_NICKNAME };
	}

	const result = await changeMyNickname(nickname);
	if (!result.ok) {
		return {
			status: "error",
			message: NICKNAME_MESSAGES[result.code] ?? NICKNAME_MESSAGES.UNKNOWN
		};
	}

	revalidatePath("/mypage");
	return { status: "success", nickname: result.nickname };
}

/* ---------- 회원 탈퇴 ---------- */

export type WithdrawState =
	| { status: "idle" }
	| { status: "error"; message: string };

export async function withdrawAction(): Promise<WithdrawState> {
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
