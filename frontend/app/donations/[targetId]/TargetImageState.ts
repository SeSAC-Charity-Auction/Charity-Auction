type TargetImageState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string };

export default TargetImageState;
