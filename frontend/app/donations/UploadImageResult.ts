type UploadImageResult =
	| { ok: true; userImage: string }
	| { ok: false; code: string };

export default UploadImageResult;
