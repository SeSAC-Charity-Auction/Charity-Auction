"use client";

import { useEffect, useId, useRef, useState } from "react";
import AuctionFilters from "./AuctionFilters";
import styles from "./page.module.css";

// 글자를 입력하면 잠시 뒤 추천 물품명을 보여줘요. 자바스크립트가 없어도 일반 GET 폼으로 검색돼요.
export default function SearchForm({ filters }: { filters: AuctionFilters }) {
	const listId = useId();
	const formRef = useRef<HTMLFormElement>(null);
	const [value, setValue] = useState(""); // 검색하면 페이지가 새로 열리므로 입력칸은 비어 있어요
	const [items, setItems] = useState<string[]>([]);
	const [open, setOpen] = useState(false);
	const [active, setActive] = useState(-1);
	// 사용자가 직접 입력했을 때만 추천을 가져와요. (선택·이동 뒤에는 다시 열지 않아요)
	const [typed, setTyped] = useState(false);

	useEffect(() => {
		const q = value.trim();
		if (!typed || !q) return;
		const ctrl = new AbortController();
		const id = window.setTimeout(async () => {
			try {
				const res = await fetch(
					`/api/auction-suggest?q=${encodeURIComponent(q)}`,
					{ signal: ctrl.signal }
				);
				const list: string[] = res.ok ? await res.json() : [];
				setItems(list);
				setActive(-1);
				setOpen(list.length > 0);
			} catch {
				// 취소되었거나 실패하면 추천만 안 보여요.
			}
		}, 200);
		return () => {
			window.clearTimeout(id);
			ctrl.abort();
		};
	}, [value, typed]);

	const choose = (title: string) => {
		setValue(title);
		setTyped(false);
		setOpen(false);
		// 값이 입력칸에 반영된 뒤에 검색해요.
		window.setTimeout(() => formRef.current?.requestSubmit(), 0);
	};

	const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (e.key === "Escape") {
			setOpen(false);
			setActive(-1);
			return;
		}
		if (e.key === "ArrowDown" || e.key === "ArrowUp") {
			if (items.length === 0) return;
			e.preventDefault();
			if (!open) {
				setOpen(true);
				return;
			}
			const dir = e.key === "ArrowDown" ? 1 : -1;
			// -1(선택 없음)을 포함해 위아래로 돌아요.
			setActive((i) => {
				const n = items.length + 1;
				return ((i + 1 + dir + n) % n) - 1;
			});
			return;
		}
		if (e.key === "Enter" && open && active >= 0) {
			e.preventDefault();
			choose(items[active]);
		}
	};

	const showList = open && value.trim() !== "" && items.length > 0;

	return (
		<form
			ref={formRef}
			action="/"
			method="get"
			role="search"
			className={styles.search}
		>
			{filters.categoryId && (
				<input
					type="hidden"
					name="category"
					value={filters.categoryId}
				/>
			)}
			{filters.status && (
				<input type="hidden" name="status" value={filters.status} />
			)}
			{filters.sort !== "ending" && (
				<input type="hidden" name="sort" value={filters.sort} />
			)}
			<label className={styles.srOnly} htmlFor="auction-q">
				경매 물품 검색
			</label>
			<div className={styles.suggestWrap}>
				<input
					id="auction-q"
					name="q"
					type="search"
					value={value}
					onChange={(e) => {
						setValue(e.target.value);
						setTyped(true);
					}}
					onKeyDown={onKeyDown}
					onFocus={() => items.length > 0 && typed && setOpen(true)}
					onBlur={() => setOpen(false)}
					placeholder="어떤 물건을 찾으세요?"
					maxLength={50}
					autoComplete="off"
					role="combobox"
					aria-expanded={showList}
					aria-controls={listId}
					aria-autocomplete="list"
					aria-activedescendant={
						showList && active >= 0 ?
							`${listId}-${active}`
						:	undefined
					}
					className={styles.searchInput}
				/>
				{showList && (
					<ul id={listId} role="listbox" className={styles.suggest}>
						{items.map((t, i) => (
							<li
								key={t}
								id={`${listId}-${i}`}
								role="option"
								aria-selected={i === active}
								className={`${styles.suggestItem} ${i === active ? styles.suggestOn : ""}`}
								// 클릭하면 입력칸이 포커스를 잃어 목록이 닫히기 전에 선택되게 해요.
								onMouseDown={(e) => {
									e.preventDefault();
									choose(t);
								}}
								onMouseEnter={() => setActive(i)}
							>
								{t}
							</li>
						))}
					</ul>
				)}
			</div>
			<button type="submit" className={styles.searchBtn}>
				검색
			</button>
		</form>
	);
}
