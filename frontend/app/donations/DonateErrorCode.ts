type DonateErrorCode =
	| "NOT_LOGGED_IN"
	| "TARGET_NOT_FOUND"
	| "TARGET_CLOSED"
	| "INVALID_AMOUNT"
	| "DONATION_EXCEEDS_TARGET"
	| "INSUFFICIENT_POINT"
	| "UNKNOWN";

export default DonateErrorCode;
