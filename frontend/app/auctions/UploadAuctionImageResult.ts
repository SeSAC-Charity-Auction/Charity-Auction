type UploadAuctionImageResult =
	| { ok: true; image: string }
	| { ok: false; code: string };

export default UploadAuctionImageResult;
