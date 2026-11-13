"use server";

// app/mypage/actions.ts
// 프로필 사진을 올릴 때 서버에서 실행되는 함수예요.

import { revalidatePath } from "next/cache";
import { uploadMyImage } from "../donations/data";

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
