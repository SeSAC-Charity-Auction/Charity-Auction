type OfferState =
	| { status: "idle" }
	| { status: "accepted"; pointAmount: number }
	| { status: "rejected" }
	| { status: "error"; message: string };

export default OfferState;
