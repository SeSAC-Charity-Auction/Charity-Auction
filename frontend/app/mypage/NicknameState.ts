type NicknameState =
	| { status: "idle" }
	| { status: "success"; nickname: string }
	| { status: "error"; message: string };

export default NicknameState;
