type UploadState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string };

export default UploadState;
