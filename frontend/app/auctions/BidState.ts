type BidState =
	| { status: "idle" }
	| { status: "success"; bidPrice: number }
	| { status: "error"; message: string };

export default BidState;
