import authHeaders from "../donations/authHeaders";
import UploadAuctionImageResult from "./UploadAuctionImageResult";

// 경매 물품 이미지를 올리거나 바꿔요. 권한(개발 환경)과 파일 검사는 백엔드가 해요.
export default async function uploadAuctionImage(
	auctionId: number,
	file: File
): Promise<UploadAuctionImageResult> {
	const headers = await authHeaders();
	if (!headers) return { ok: false, code: "NOT_LOGGED_IN" };
	try {
		const body = new FormData();
		body.append("file", file);
		// Content-Type은 직접 정하지 않아요. (fetch가 multipart 경계값까지 알아서 붙여요)
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/auctions/${auctionId}/image`,
			{ method: "POST", headers, body, cache: "no-store" }
		);
		const data = await res.json();
		if (!res.ok) return { ok: false, code: data.code ?? "UNKNOWN" };
		return { ok: true, image: data.image };
	} catch {
		return { ok: false, code: "UNKNOWN" };
	}
}
