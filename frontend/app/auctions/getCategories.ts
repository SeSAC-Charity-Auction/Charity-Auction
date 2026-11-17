import Category from "./Category";

export default async function getCategories(): Promise<Category[]> {
	const res = await fetch(`${process.env.API_BASE_URL}/api/v1/categories`, {
		cache: "no-store"
	});
	if (!res.ok) throw new Error("카테고리를 불러오지 못했어요.");
	return res.json();
}
