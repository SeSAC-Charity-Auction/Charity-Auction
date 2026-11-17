import { connection } from "next/server";
import getMyPoints from "./getMyPoints";
import WalletSignedOut from "./WalletSignedOut";
import WalletCard from "./WalletCard";

export default async function MyWallet() {
	await connection();
	const points = await getMyPoints();
	if (!points) return <WalletSignedOut />;
	return <WalletCard points={points} />;
}
