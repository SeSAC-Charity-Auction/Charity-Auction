type UploadTargetImageResult =
	| { ok: true; targetImage: string }
	| { ok: false; code: string };

export default UploadTargetImageResult;
