import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	/* config options here */
	experimental: {
		agentFeedback: true,
		// 프로필 사진(최대 2MB)이 서버 액션 기본 한도(1MB)에 걸리지 않게 해요.
		serverActions: { bodySizeLimit: "3mb" }
	},
	// 백엔드가 돌려주는 /uploads/... 주소를 브라우저가 같은 도메인에서 불러올 수 있게 넘겨 줘요.
	async rewrites() {
		return [
			{
				source: "/uploads/:path*",
				destination: `${process.env.API_BASE_URL}/uploads/:path*`
			}
		];
	},
	cacheComponents: true,
	partialPrefetching: true,
	turbopack: {
		rules: {
			"*.css": {
				condition: { not: { path: "*.module.css" } },
				loaders: ["@tailwindcss/turbopack"],
				as: "*.css"
			}
		}
	}
};

export default nextConfig;
