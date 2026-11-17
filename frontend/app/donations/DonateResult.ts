import DonateErrorCode from "./DonateErrorCode";

type DonateResult =
	| { ok: true; amount: number; balance: number } // balance: 기부 후 남은 포인트
	| { ok: false; code: DonateErrorCode };

export default DonateResult;
