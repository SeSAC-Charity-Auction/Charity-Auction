import { Field } from "./rules";

// 서버 액션의 결과예요. 입력했던 값(비밀번호는 제외)을 돌려줘서, 실패해도 다시 쓰지 않게 해요.
type SignupState =
	| { status: "idle" }
	| {
			status: "error";
			values: { email: string; nickname: string; name: string };
			errors: Partial<Record<Field, string>>;
			message: string; // 칸 하나에 묶이지 않는 오류
	  };

export default SignupState;
