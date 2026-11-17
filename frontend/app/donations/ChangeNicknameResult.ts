type ChangeNicknameResult =
	| { ok: true; nickname: string }
	| { ok: false; code: string };

export default ChangeNicknameResult;
