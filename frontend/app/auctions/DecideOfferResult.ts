type DecideOfferResult =
	| { ok: true; pointAmount: number | null }
	| { ok: false; code: string };

export default DecideOfferResult;
