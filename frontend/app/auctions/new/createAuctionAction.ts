"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import authHeaders from "../../donations/authHeaders";
import itemMessage, { readErrorCode } from "../item/itemMessages";
import ItemFormState from "../item/ItemFormState";
import { readItemValues, validateItem } from "../item/itemRules";

export default async function createAuctionAction(
	_prev: ItemFormState,
	formData: FormData
): Promise<ItemFormState> {
	const values = readItemValues(formData);
	const fieldErrors = validateItem(values, { requireImage: true, schedule: "create" });
	const scheduled = values.startMode === "scheduled";
	const startAt = scheduled ? values.startAt : undefined;
	const endAt = scheduled ? values.endAt : undefined;
	if (Object.keys(fieldErrors).length > 0 || !values.file) {
		return { status: "error", message: "입력한 내용을 확인해 주세요.", fieldErrors };
	}

	const headers = await authHeaders();
	if (!headers) return { status: "error", message: itemMessage("NOT_LOGGED_IN") };

	let auctionId: number;
	try {
		const body = new FormData();
		body.append(
			"auction",
			new Blob(
				[
					JSON.stringify({
						title: values.title,
						description: values.description || null,
						categoryId: values.categoryId,
						startPrice: values.startPrice,
						startAt: startAt ? `${startAt}:00` : null,
						endAt: endAt ? `${endAt}:00` : null
					})
				],
				{ type: "application/json" }
			)
		);
		body.append("file", values.file, values.file.name);
		const res = await fetch(`${process.env.API_BASE_URL}/api/v1/auctions`, {
			method: "POST",
			headers,
			body,
			cache: "no-store"
		});
		if (!res.ok) {
			const { code, message } = await readErrorCode(res);
			return { status: "error", message: itemMessage(code, message) };
		}
		const data = await res.json();
		auctionId = Number(data.auctionId);
	} catch {
		return { status: "error", message: itemMessage("UNKNOWN") };
	}

	revalidatePath("/");
	revalidatePath("/mypage", "layout");
	redirect(`/auctions/${auctionId}`);
}
