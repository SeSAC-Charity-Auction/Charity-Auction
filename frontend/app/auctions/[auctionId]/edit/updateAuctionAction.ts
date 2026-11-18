"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import authHeaders from "../../../donations/authHeaders";
import getAuctionForEdit from "../../item/getAuctionForEdit";
import itemMessage, { readErrorCode } from "../../item/itemMessages";
import ItemFormState from "../../item/ItemFormState";
import { readItemValues, validateItem } from "../../item/itemRules";

export default async function updateAuctionAction(
	_prev: ItemFormState,
	formData: FormData
): Promise<ItemFormState> {
	const auctionId = Number(formData.get("auctionId"));
	if (!Number.isInteger(auctionId) || auctionId <= 0) {
		return { status: "error", message: itemMessage("AUCTION_NOT_FOUND") };
	}
	const values = readItemValues(formData);

	const fieldErrors = validateItem(values, { requireImage: false, schedule: "edit" });
	if (Object.keys(fieldErrors).length > 0) {
		return { status: "error", message: "입력한 내용을 확인해 주세요.", fieldErrors };
	}

	const headers = await authHeaders();
	if (!headers) return { status: "error", message: itemMessage("NOT_LOGGED_IN") };

	const current = await getAuctionForEdit(auctionId);
	if (current.kind === "notFound") {
		return { status: "error", message: itemMessage("AUCTION_NOT_FOUND") };
	}
	if (current.kind === "loginRequired") {
		return { status: "error", message: itemMessage("NOT_LOGGED_IN") };
	}
	if (current.kind === "error") {
		return { status: "error", message: itemMessage("UNKNOWN") };
	}

	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}`,
			{
				method: "PUT",
				headers: { ...headers, "Content-Type": "application/json" },
				body: JSON.stringify({
					title: values.title,
					description: values.description || null,
					image: current.auction.image,
					categoryId: values.categoryId,
					startPrice: values.startPrice,
					startAt: `${values.startAt}:00`,
					endAt: `${values.endAt}:00`
				}),
				cache: "no-store"
			}
		);
		if (!res.ok) {
			const { code, message } = await readErrorCode(res);
			return { status: "error", message: itemMessage(code, message) };
		}
	} catch {
		return { status: "error", message: itemMessage("UNKNOWN") };
	}

	if (values.file) {
		try {
			const body = new FormData();
			body.append("file", values.file, values.file.name);
			const res = await fetch(
				`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}/image`,
				{ method: "POST", headers, body, cache: "no-store" }
			);
			if (!res.ok) {
				const { code, message } = await readErrorCode(res);
				revalidatePath(`/auctions/${auctionId}`);
				return {
					status: "error",
					message: `내용은 저장했지만 이미지는 바꾸지 못했어요. ${itemMessage(code, message)}`
				};
			}
		} catch {
			revalidatePath(`/auctions/${auctionId}`);
			return {
				status: "error",
				message: "내용은 저장했지만 이미지는 바꾸지 못했어요. 잠시 뒤에 다시 시도해 주세요."
			};
		}
	}

	revalidatePath("/");
	revalidatePath(`/auctions/${auctionId}`);
	revalidatePath("/mypage", "layout");
	redirect(`/auctions/${auctionId}`);
}
