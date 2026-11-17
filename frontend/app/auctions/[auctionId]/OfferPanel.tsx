import { connection } from "next/server";
import getMyOffer from "../getMyOffer";
import secondsUntil from "../secondsUntil";
import OfferForm from "./OfferForm";

// 내가 최고가로 낙찰 기회를 받았을 때만 나타나요. (사람마다 다른 값이라 요청이 올 때 그려요)
export default async function OfferPanel({ auctionId }: { auctionId: number }) {
	await connection();
	const offer = await getMyOffer(auctionId);
	if (!offer) return null;

	return (
		<OfferForm
			candidateId={offer.candidateId}
			bidPrice={offer.bidPrice}
			secondsLeft={offer.deadlineAtIso ? secondsUntil(offer.deadlineAtIso) : null}
		/>
	);
}
