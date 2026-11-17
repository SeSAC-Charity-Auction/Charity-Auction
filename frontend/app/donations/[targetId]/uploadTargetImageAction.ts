"use server";

// app/donations/[targetId]/actions.ts
// 기부처 이미지를 올릴 때 서버에서 실행되는 함수예요.

import { revalidatePath } from "next/cache";
import TargetImageState from "./TargetImageState";
import uploadTargetImage from "../uploadTargetImage";

const MAX_BYTES = 2 * 1024 * 1024;

const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	FORBIDDEN: "기부처 이미지를 바꿀 권한이 없어요.",
	TARGET_NOT_FOUND: "기부처를 찾을 수 없어요.",
	INVALID_IMAGE: "PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.",
	IMAGE_TOO_LARGE: "이미지는 2MB 이하만 올릴 수 있어요.",
	UNKNOWN: "이미지를 올리지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export default async function uploadTargetImageAction(
	_prev: TargetImageState,
	formData: FormData
): Promise<TargetImageState> {
	const targetId = Number(formData.get("targetId"));
	const file = formData.get("file");
	if (!Number.isInteger(targetId) || targetId <= 0) {
		return { status: "error", message: MESSAGES.TARGET_NOT_FOUND };
	}
	if (!(file instanceof File) || file.size === 0) {
		return { status: "error", message: MESSAGES.INVALID_IMAGE };
	}
	if (file.size > MAX_BYTES) {
		return { status: "error", message: MESSAGES.IMAGE_TOO_LARGE };
	}
	const result = await uploadTargetImage(targetId, file);
	if (!result.ok) {
		return {
			status: "error",
			message: MESSAGES[result.code] ?? MESSAGES.UNKNOWN
		};
	}
	// 목록과 이 기부처 상세가 새 이미지로 다시 그려지게 해요.
	revalidatePath("/donations");
	revalidatePath(`/donations/${targetId}`);
	return { status: "success" };
}
