export const MAX_BYTES = 2 * 1024 * 1024;

export const MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: "로그인이 필요해요. 로그인한 뒤 다시 시도해 주세요.",
	INVALID_IMAGE: "PNG, JPG, WEBP, GIF 이미지만 올릴 수 있어요.",
	IMAGE_TOO_LARGE: "이미지는 2MB 이하만 올릴 수 있어요.",
	UNKNOWN: "사진을 올리지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};

export const NICKNAME_MESSAGES: Record<string, string> = {
	NOT_LOGGED_IN: MESSAGES.NOT_LOGGED_IN,
	INVALID_NICKNAME: "닉네임은 2자 이상 10자 이하로 입력해 주세요.",
	DUPLICATE_NICKNAME: "이미 사용 중인 닉네임이에요.",
	UNKNOWN: "닉네임을 바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요."
};
