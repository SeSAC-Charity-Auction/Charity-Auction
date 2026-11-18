// 회원가입 입력 규칙이에요. 백엔드(SignupRequest)의 검사와 같게 맞췄어요. (화면과 서버 액션이 함께 써요)

export type Field = "email" | "password" | "passwordConfirm" | "nickname" | "name";

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateField(
	field: Field,
	value: string,
	password = ""
): string {
	switch (field) {
		case "email":
			if (!value) return "이메일을 입력해 주세요.";
			if (value.length > 254 || !EMAIL.test(value))
				return "올바른 이메일 형식이 아니에요.";
			return "";
		case "password":
			if (!value) return "비밀번호를 입력해 주세요.";
			if (value.length < 8 || value.length > 20)
				return "비밀번호는 8자 이상 20자 이하로 입력해 주세요.";
			return "";
		case "passwordConfirm":
			if (!value) return "비밀번호를 한 번 더 입력해 주세요.";
			if (value !== password) return "비밀번호가 서로 달라요.";
			return "";
		case "nickname":
			if (!value) return "닉네임을 입력해 주세요.";
			if (value.length < 2 || value.length > 10)
				return "닉네임은 2자 이상 10자 이하로 입력해 주세요.";
			return "";
		case "name":
			if (!value) return "이름을 입력해 주세요.";
			if (value.length < 2 || value.length > 10)
				return "이름은 2자 이상 10자 이하로 입력해 주세요.";
			return "";
	}
}
