type AuctionImageState =
	| { status: "idle" }
	| { status: "success" }
	| { status: "error"; message: string };

export default AuctionImageState;
