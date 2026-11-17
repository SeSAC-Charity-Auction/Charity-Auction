import PointEntry from "./PointEntry";

type PointPage = {
	items: PointEntry[]; // 최신순
	page: number;
	size: number;
	totalElements: number;
	totalPages: number;
};

export default PointPage;
