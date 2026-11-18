export const TITLE_MAX = 100;
export const DESCRIPTION_MAX = 2000;
export const MIN_START_PRICE = 1000;
export const MAX_START_PRICE = 1_000_000_000;
export const IMAGE_MAX_BYTES = 2 * 1024 * 1024;
export const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"];
export const IMAGE_ACCEPT = IMAGE_TYPES.join(",");

export type ItemField =
	| "title"
	| "description"
	| "categoryId"
	| "startPrice"
	| "startAt"
	| "endAt"
	| "file";

export type FieldErrors = Partial<Record<ItemField, string>>;
export const MIN_DURATION_HOURS = 1;
export const MAX_DURATION_DAYS = 7;
export type ItemValues = {
	title: string;
	description: string;
	categoryId: number;
	startPrice: number;
	startMode: "now" | "scheduled";
	startAt?: string;
	endAt?: string;
	file: File | null;
};
export type ScheduleRule = "create" | "edit";

const DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

export function readItemValues(formData: FormData): ItemValues {
	const file = formData.get("file");
	const text = (name: string) => {
		const value = String(formData.get(name) ?? "").trim();
		return value === "" ? undefined : value;
	};
	return {
		title: String(formData.get("title") ?? "").trim(),
		description: String(formData.get("description") ?? "").trim(),
		categoryId: Number(formData.get("categoryId")),
		startPrice: Number(formData.get("startPrice")),
		startMode: formData.get("startMode") === "scheduled" ? "scheduled" : "now",
		startAt: text("startAt"),
		endAt: text("endAt"),
		file: file instanceof File && file.size > 0 ? file : null
	};
}

export function imageError(file: File): string | null {
	if (!IMAGE_TYPES.includes(file.type)) {
		return "PNG, JPG, GIF, WEBP 이미지만 올릴 수 있어요.";
	}
	if (file.size > IMAGE_MAX_BYTES) return "이미지는 2MB 이하만 올릴 수 있어요.";
	return null;
}

function between(start: string, end: string): number {
	return Date.parse(`${end}:00Z`) - Date.parse(`${start}:00Z`);
}

export function validateItem(
	values: ItemValues,
	{ requireImage, schedule }: { requireImage: boolean; schedule: ScheduleRule }
): FieldErrors {
	const errors: FieldErrors = {};
	if (!values.title) errors.title = "물품 이름을 입력해 주세요.";
	else if (values.title.length > TITLE_MAX) {
		errors.title = `물품 이름은 ${TITLE_MAX}자 이하로 입력해 주세요.`;
	}
	if (values.description.length > DESCRIPTION_MAX) {
		errors.description = `설명은 ${DESCRIPTION_MAX.toLocaleString("ko-KR")}자 이하로 입력해 주세요.`;
	}
	if (!Number.isInteger(values.categoryId) || values.categoryId <= 0) {
		errors.categoryId = "카테고리를 골라 주세요.";
	}
	if (
		!Number.isInteger(values.startPrice) ||
		values.startPrice < MIN_START_PRICE ||
		values.startPrice > MAX_START_PRICE
	) {
		errors.startPrice = `시작 가격은 ${MIN_START_PRICE.toLocaleString("ko-KR")}원 이상 ${MAX_START_PRICE.toLocaleString("ko-KR")}원 이하의 정수로 입력해 주세요.`;
	}
	const hasSchedule = schedule === "edit" || values.startMode === "scheduled";
	if (hasSchedule && (!values.startAt || !DATE_TIME.test(values.startAt))) {
		errors.startAt = "경매 시작 시각을 입력해 주세요.";
	}
	if (hasSchedule && (!values.endAt || !DATE_TIME.test(values.endAt))) {
		errors.endAt = "경매 마감 시각을 입력해 주세요.";
	} else if (hasSchedule && values.startAt && values.endAt && !errors.startAt) {
		const gap = between(values.startAt, values.endAt);
		if (gap <= 0) {
			errors.endAt = "마감 시각은 시작 시각보다 뒤여야 해요.";
		} else if (
			gap < MIN_DURATION_HOURS * 3600_000 ||
			gap > MAX_DURATION_DAYS * 86_400_000
		) {
			errors.endAt = `경매 기간은 ${MIN_DURATION_HOURS}시간 이상 ${MAX_DURATION_DAYS}일 이하로 정해 주세요.`;
		}
	}
	if (values.file) {
		const message = imageError(values.file);
		if (message) errors.file = message;
	} else if (requireImage) {
		errors.file = "물품 이미지를 골라 주세요.";
	}
	return errors;
}
