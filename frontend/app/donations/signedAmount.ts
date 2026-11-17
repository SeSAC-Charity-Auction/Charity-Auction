import PointEntry from "./PointEntry";

const signedAmount = (e: PointEntry) =>
	(e.pointType === "적립" ? 1 : -1) * Math.abs(e.pointAmount);

export default signedAmount;
