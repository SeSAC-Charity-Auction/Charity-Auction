import authHeaders from "./authHeaders";
import UploadTargetImageResult from "./UploadTargetImageResult";

export default async function uploadTargetImage(
	targetId: number,
	file: File
): Promise<UploadTargetImageResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const body = new FormData();
		body.append("file", file);
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/donation-targets/${targetId}/image`,
			{ method: "POST", headers, body, cache: "no-store" }
		);
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, targetImage: data.targetImage };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
