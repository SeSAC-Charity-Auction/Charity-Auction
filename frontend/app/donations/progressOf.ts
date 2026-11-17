import DonationTarget from "./DonationTarget";

export default function progressOf(target: DonationTarget) {
	const pct =
		target.targetAmount > 0 ?
			Math.floor((target.totalDonation / target.targetAmount) * 100)
		:	0;
	return { pct, barWidth: Math.min(100, pct) };
}
