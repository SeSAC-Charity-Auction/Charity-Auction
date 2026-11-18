"use server";

// 이메일·닉네임이 이미 쓰이는지 백엔드에 물어봐요. (입력칸을 벗어날 때 화면에서 불러요)

import { validateField } from "./rules";

export type DuplicateResult = { available: boolean; message: string } | null;

export default async function checkDuplicateAction(
	kind: "email" | "nickname",
	value: string
): Promise<DuplicateResult> {
	const v = value.trim();
	if (validateField(kind, v)) return null; // 형식부터 틀리면 물어보지 않아요
	try {
		const res = await fetch(
			`${process.env.API_BASE_URL}/api/v1/users/check-${kind}?${new URLSearchParams({ [kind]: v })}`,
			{ cache: "no-store" }
		);
		if (!res.ok) return null;
		const data: { available: boolean; message: string } = await res.json();
		return { available: data.available, message: data.message };
	} catch {
		return null; // 확인하지 못해도 가입은 계속할 수 있어요. (가입할 때 서버가 다시 막아요)
	}
}
