type WithdrawState =
	| { status: "idle" }
	| { status: "error"; message: string };

export default WithdrawState;
