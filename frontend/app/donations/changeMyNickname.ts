import authHeaders from "./authHeaders";
import ChangeNicknameResult from "./ChangeNicknameResult";

export default async function changeMyNickname(
	nickname: string
): Promise<ChangeNicknameResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const res = await fetch(`${process.env.API_BASE_URL}/api/me/nickname`, {
			method: "PATCH",
			headers: { "Content-Type": "application/json", ...headers },
			body: JSON.stringify({ nickname }),
			cache: "no-store"
		});
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, nickname: data.nickname };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
