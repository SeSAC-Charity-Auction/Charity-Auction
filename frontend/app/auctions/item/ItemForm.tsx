"use client";

import { startTransition, useActionState, useState } from "react";
import loginStyles from "../../login/page.module.css";
import Category from "../Category";
import ImageField from "./ImageField";
import ItemFormState from "./ItemFormState";
import styles from "./itemForm.module.css";
import {
	DESCRIPTION_MAX,
	type FieldErrors,
	type ItemField,
	MAX_DURATION_DAYS,
	MAX_START_PRICE,
	MIN_DURATION_HOURS,
	MIN_START_PRICE,
	TITLE_MAX,
	readItemValues,
	validateItem
} from "./itemRules";

export type ItemInitialValues = {
	title: string;
	description: string;
	categoryId: number | null;
	startPrice: number | null;
	startAt?: string;
	endAt?: string;
	image?: string | null;
};

const idle: ItemFormState = { status: "idle" };

export default function ItemForm({
	mode,
	action,
	categories,
	initial,
	auctionId
}: {
	mode: "create" | "edit";
	action: (prev: ItemFormState, formData: FormData) => Promise<ItemFormState>;
	categories: Category[];
	initial: ItemInitialValues;
	auctionId?: number;
}) {
	const [state, formAction, pending] = useActionState(action, idle);
	const [clientErrors, setClientErrors] = useState<FieldErrors>({});
	const [price, setPrice] = useState(
		initial.startPrice === null ? "" : String(initial.startPrice)
	);
	const isEdit = mode === "edit";
	const [startMode, setStartMode] = useState<"now" | "scheduled">("now");
	const showStartAt = isEdit || startMode === "scheduled";

	const serverErrors = state.status === "error" ? (state.fieldErrors ?? {}) : {};
	const errorOf = (field: ItemField) => clientErrors[field] ?? serverErrors[field];
	const formError =
		state.status === "error" && Object.keys(clientErrors).length === 0 ?
			state.message
		:	"";

	const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
		e.preventDefault();
		const formData = new FormData(e.currentTarget);
		const errors = validateItem(readItemValues(formData), {
			requireImage: !isEdit,
			schedule: isEdit ? "edit" : "create"
		});
		setClientErrors(errors);
		if (Object.keys(errors).length > 0) {
			const firstField = Object.keys(errors)[0];
			e.currentTarget
				.querySelector<HTMLElement>(`[data-field="${firstField}"]`)
				?.focus();
			return;
		}
		startTransition(() => formAction(formData));
	};

	const onFieldChange = (e: React.FormEvent<HTMLFormElement>) => {
		const field = (e.target as HTMLElement).dataset?.field as ItemField | undefined;
		if (!field || !clientErrors[field]) return;
		setClientErrors((prev) => {
			const next = { ...prev };
			delete next[field];
			return next;
		});
	};

	const fieldProps = (field: ItemField) => ({
		"aria-invalid": errorOf(field) ? true : undefined,
		"aria-describedby": `item-${field}-error`,
		"data-field": field,
		disabled: pending
	});
	const fieldError = (field: ItemField) => (
		<p
			id={`item-${field}-error`}
			className={styles.fieldError}
			role={errorOf(field) ? "alert" : undefined}
		>
			{errorOf(field) ?? ""}
		</p>
	);

	const priceNumber = Number(price);
	const pricePreview =
		price !== "" && Number.isInteger(priceNumber) && priceNumber > 0 ?
			`${priceNumber.toLocaleString("ko-KR")}원`
		:	"";

	return (
		<form
			onSubmit={onSubmit}
			onChange={onFieldChange}
			className={loginStyles.form}
			noValidate
		>
			{auctionId !== undefined && (
				<input type="hidden" name="auctionId" value={auctionId} />
			)}

			<div className={loginStyles.field}>
				<label htmlFor="item-title" className={loginStyles.label}>
					물품 이름
				</label>
				<input
					id="item-title"
					name="title"
					defaultValue={initial.title}
					maxLength={TITLE_MAX}
					required
					autoComplete="off"
					placeholder="예: 직접 뜬 털목도리"
					className={loginStyles.input}
					{...fieldProps("title")}
				/>
				{fieldError("title")}
			</div>

			<div className={loginStyles.field}>
				<label htmlFor="item-description" className={loginStyles.label}>
					물품 설명 <span className={styles.optional}>(선택)</span>
				</label>
				<textarea
					id="item-description"
					name="description"
					defaultValue={initial.description}
					maxLength={DESCRIPTION_MAX}
					rows={6}
					placeholder="물품의 상태, 크기, 사연 등을 알려 주세요."
					className={`${loginStyles.input} ${styles.textarea}`}
					{...fieldProps("description")}
				/>
				{fieldError("description")}
			</div>

			<div className={styles.twoCols}>
				<div className={loginStyles.field}>
					<label htmlFor="item-category" className={loginStyles.label}>
						카테고리
					</label>
					<select
						id="item-category"
						name="categoryId"
						defaultValue={initial.categoryId ?? ""}
						required
						className={`${loginStyles.input} ${styles.select}`}
						{...fieldProps("categoryId")}
					>
						<option value="" disabled>
							카테고리 고르기
						</option>
						{categories.map((c) => (
							<option key={c.categoryId} value={c.categoryId}>
								{c.categoryName}
							</option>
						))}
					</select>
					{fieldError("categoryId")}
				</div>

				<div className={loginStyles.field}>
					<label htmlFor="item-price" className={loginStyles.label}>
						시작 가격 (원)
					</label>
					<input
						id="item-price"
						name="startPrice"
						type="number"
						inputMode="numeric"
						min={MIN_START_PRICE}
						max={MAX_START_PRICE}
						step={1}
						value={price}
						onChange={(e) => setPrice(e.target.value)}
						required
						className={loginStyles.input}
						{...fieldProps("startPrice")}
					/>
					<p className={styles.help} aria-live="polite">
						{pricePreview || `${MIN_START_PRICE.toLocaleString("ko-KR")}원 이상`}
					</p>
					{fieldError("startPrice")}
				</div>
			</div>

			<fieldset className={styles.fieldset}>
				<legend className={loginStyles.label}>경매 기간</legend>
				{!isEdit && (
					<div className={styles.choices}>
						<label className={styles.choice}>
							<input
								type="radio"
								name="startMode"
								value="now"
								checked={startMode === "now"}
								onChange={() => setStartMode("now")}
								disabled={pending}
							/>
							등록하면 바로 시작
						</label>
						<label className={styles.choice}>
							<input
								type="radio"
								name="startMode"
								value="scheduled"
								checked={startMode === "scheduled"}
								onChange={() => setStartMode("scheduled")}
								disabled={pending}
							/>
							시작 시각 예약
						</label>
					</div>
				)}
				{showStartAt ?
					<>
						<div className={styles.twoCols}>
							<div className={loginStyles.field}>
								<label htmlFor="item-startAt" className={loginStyles.label}>
									시작 시각
								</label>
								<input
									id="item-startAt"
									name="startAt"
									type="datetime-local"
									defaultValue={initial.startAt}
									required
									className={loginStyles.input}
									{...fieldProps("startAt")}
								/>
								{fieldError("startAt")}
							</div>
							<div className={loginStyles.field}>
								<label htmlFor="item-endAt" className={loginStyles.label}>
									마감 시각
								</label>
								<input
									id="item-endAt"
									name="endAt"
									type="datetime-local"
									defaultValue={initial.endAt}
									required
									className={loginStyles.input}
									{...fieldProps("endAt")}
								/>
								{fieldError("endAt")}
							</div>
						</div>
						<p className={styles.help}>
							경매 기간은 {MIN_DURATION_HOURS}시간 이상 {MAX_DURATION_DAYS}일
							이하예요.
							{!isEdit && " 시작 시각은 30일 안으로 예약할 수 있어요."}
						</p>
					</>
				:	<p className={styles.help}>
						등록하는 즉시 시작되고, 24시간 뒤에 마감돼요.
					</p>
				}
			</fieldset>

			<ImageField
				currentImage={initial.image ?? null}
				required={!isEdit}
				disabled={pending}
				serverError={errorOf("file")}
			/>

			<p className={loginStyles.error} role={formError ? "alert" : undefined}>
				{formError}
			</p>

			<button
				type="submit"
				className={`${loginStyles.btn} ${loginStyles.btnPrimary} ${loginStyles.submit}`}
				disabled={pending}
			>
				{pending ?
					isEdit ? "저장하는 중" : "등록하는 중"
				: isEdit ?
					"수정 내용 저장"
				:	"경매 등록하기"}
			</button>
		</form>
	);
}
