import { Metadata } from "next";
import getDonationTarget from "../getDonationTarget";

export default async function generateMetadata({
	params
}: {
	params: Promise<{ targetId: string }>;
}): Promise<Metadata> {
	const id = Number((await params).targetId);
	if (!Number.isInteger(id) || id <= 0) return { title: "기부처" };
	const detail = await getDonationTarget(id).catch(() => null);
	if (!detail) return { title: "기부처" };
	const { target } = detail;
	const description =
		target.description?.trim().slice(0, 150) ||
		`${target.targetName}에 포인트로 기부해 보세요.`;
	return {
		title: target.targetName,
		description,
		openGraph: {
			title: target.targetName,
			description,
			images: target.targetImage ? [target.targetImage] : undefined
		}
	};
}
