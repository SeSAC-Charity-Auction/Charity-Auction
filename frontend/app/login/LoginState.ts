type LoginState =
	| { status: "idle"; email: string }
	| { status: "error"; email: string; message: string };

export default LoginState;
