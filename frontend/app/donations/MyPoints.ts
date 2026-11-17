import PointEntry from "./PointEntry";

type MyPoints = {
	balance: number; // 지금 쓸 수 있는 포인트
	recent: PointEntry[]; // 최신순으로 6~8건 정도
};

export default MyPoints;
