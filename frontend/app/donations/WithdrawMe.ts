import authHeaders from "./authHeaders";
import WithdrawResult from "./WithdrawResult";

export default async function withdrawMe(): Promise<WithdrawResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/me`, {
			method: "DELETE",
			headers,
			cache: "no-store"
		});
		if (res.ok) return { ok: true };
		const data = await res.json().catch(() => null);
		return { ok: false, code: data?.code ?? "UNKNOWN" };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
