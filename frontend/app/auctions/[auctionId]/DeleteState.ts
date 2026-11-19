type DeleteState =
	| { status: "idle" }
	| { status: "error"; message: string };

export default DeleteState;
