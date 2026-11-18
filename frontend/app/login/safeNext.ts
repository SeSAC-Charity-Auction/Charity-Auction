export default function safeNext(value: unknown): string {
	if (typeof value !== "string") return "/";
	if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
		return "/";
	}
	for (const page of ["/login", "/signup"]) {
		if (value === page || value.startsWith(`${page}?`)) return "/";
	}
	return value;
}
