import type { FieldErrors } from "./itemRules";

type ItemFormState =
	| { status: "idle" }
	| { status: "error"; message: string; fieldErrors?: FieldErrors };

export default ItemFormState;
