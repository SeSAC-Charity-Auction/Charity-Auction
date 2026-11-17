type DonateState =
	| { status: "idle" }
	| { status: "success"; amount: number; balance: number }
	| { status: "error"; message: string };

export default DonateState;
