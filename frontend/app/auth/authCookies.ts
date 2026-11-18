export const ACCESS_COOKIE = "accessToken";
export const REFRESH_COOKIE = "refreshToken";
export const BACKEND_REFRESH_COOKIE = "refresh_token";

export function cookieOptions(maxAge: number) {
	return {
		httpOnly: true,
		sameSite: "lax" as const,
		secure: process.env.NODE_ENV === "production",
		path: "/",
		maxAge
	};
}
