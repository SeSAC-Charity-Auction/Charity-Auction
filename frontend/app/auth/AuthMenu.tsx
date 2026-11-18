import { cookies } from "next/headers";
import { Suspense } from "react";
import { ACCESS_COOKIE } from "./authCookies";
import AuthMenuView from "./AuthMenuView";

async function AuthMenuContent() {
	const loggedIn = Boolean((await cookies()).get(ACCESS_COOKIE)?.value);
	return <AuthMenuView loggedIn={loggedIn} />;
}

export default function AuthMenu() {
	return (
		<Suspense fallback={null}>
			<AuthMenuContent />
		</Suspense>
	);
}
