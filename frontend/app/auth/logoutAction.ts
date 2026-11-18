"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
	ACCESS_COOKIE,
	BACKEND_REFRESH_COOKIE,
	REFRESH_COOKIE
} from "./authCookies";

export default async function logoutAction() {
	const store = await cookies();
	const refreshToken = store.get(REFRESH_COOKIE)?.value;

	if (refreshToken) {
		try {
			await fetch(`${process.env.API_BASE_URL}/api/v1/auth/logout`, {
				method: "POST",
				headers: {
					Cookie: `${BACKEND_REFRESH_COOKIE}=${refreshToken}`
				},
				cache: "no-store"
			});
		} catch {}
	}

	store.delete(ACCESS_COOKIE);
	store.delete(REFRESH_COOKIE);
	revalidatePath("/", "layout");
	redirect("/");
}
