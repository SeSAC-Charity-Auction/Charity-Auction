import authHeaders from "./authHeaders";
import UploadImageResult from "./UploadImageResult";

export default async function uploadMyImage(
	file: File
): Promise<UploadImageResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const body = new FormData();
		body.append("file", file);
		// Content-Type은 직접 정하지 않아요. (fetch가 multipart 경계값까지 알아서 붙여요)
		const res = await fetch(`${process.env.API_BASE_URL}/api/me/image`, {
			method: "POST",
			headers,
			body,
			cache: "no-store"
		});
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, userImage: data.userImage };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
