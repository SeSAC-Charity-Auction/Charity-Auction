export default function safeNext(value: unknown): string {
	if (typeof value !== "string") return "/";
	if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
		return "/";
	}
	if (value === "/login" || value.startsWith("/login?")) return "/";
	return value;
}
