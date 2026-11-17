import { cookies } from "next/headers";

export default async function authHeaders(): Promise<Record<
	string,
	string
> | null> {
	const token = (await cookies()).get("accessToken")?.value;
	if (token) return { Authorization: `Bearer ${token}` };
	const devUserId = process.env.DEV_USER_ID;
	if (devUserId) return { "X-Dev-User-Id": devUserId };
	return null;
}
