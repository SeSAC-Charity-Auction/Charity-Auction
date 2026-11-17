"use server";

import { revalidatePath } from "next/cache";
import uploadMyImage from "../donations/uploadMyImage";
import UploadState from "./UploadState";
import { MAX_BYTES, MESSAGES } from "./constants";

export default async function uploadImageAction(
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
	revalidatePath("/", "layout"); // 위쪽 메뉴의 프로필 사진까지 새 사진으로 다시 그려요
	return { status: "success" };
}
