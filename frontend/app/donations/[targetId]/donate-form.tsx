"use client";

// app/donations/[targetId]/donate-form.tsx
// 슬라이더로 기부 포인트를 정하는 폼이에요. 브라우저에서 움직여야 해서 클라이언트 컴포넌트예요.

import Link from "next/link";
import { useActionState, useState } from "react";
import { donateAction, type DonateState } from "../actions";
import { display } from "../fonts";
import { DONATION_STEP, MIN_DONATION } from "../rules";
import styles from "./page.module.css";

type Props = {
  targetId: number;
  targetName: string;
  balance: number; // 지금 쓸 수 있는 포인트
  currentTotal: number; // 이 기부처의 누적 기부금
  targetAmount: number; // 이 기부처의 목표 금액
};

const initialState: DonateState = { status: "idle" };

const pt = (n: number) => `${n.toLocaleString("ko-KR")}P`;
const toStep = (n: number) => Math.floor(n / DONATION_STEP) * DONATION_STEP;
const pctOf = (part: number, whole: number) => (whole > 0 ? (part / whole) * 100 : 0);
const clampPct = (n: number) => Math.max(0, Math.min(100, n));
const formatPct = (n: number) => (n < 1 ? "1% 미만" : `${Math.round(n)}%`);

export default function DonateForm({
  targetId,
  targetName,
  balance,
  currentTotal,
  targetAmount,
}: Props) {
  const [state, formAction, isPending] = useActionState(donateAction, initialState);

  const max = toStep(balance); // 슬라이더 맨 오른쪽 (잔액을 단위에 맞춰 내림)
  const canDonate = max >= MIN_DONATION;

  // 처음에는 내 포인트의 4분의 1 정도로 시작해요.
  const [rawAmount, setRawAmount] = useState(() => Math.max(MIN_DONATION, toStep(max / 4)));
  // 기부 후 잔액이 줄어들어도 슬라이더 범위를 벗어나지 않게 맞춰요.
  const amount = canDonate ? Math.min(Math.max(rawAmount, MIN_DONATION), max) : 0;

  if (!canDonate) {
    return (
      <div className={styles.panelQuiet}>
        <h2 className={`${styles.panelQuietTitle} ${display.className}`}>기부하기</h2>
        <p className={styles.panelQuietText}>
          기부하려면 포인트가 {pt(MIN_DONATION)} 이상 있어야 해요. 지금은 {pt(balance)}를 갖고
          있어요.
        </p>
        <Link href="/mypage/points" className={styles.textLink}>
          내 포인트 확인하기
        </Link>
      </div>
    );
  }

  const fillPct = max > MIN_DONATION ? ((amount - MIN_DONATION) / (max - MIN_DONATION)) * 100 : 100;

  // 이 기부로 목표 막대가 얼마나 더 채워지는지 미리 보여줘요.
  const nowPct = pctOf(currentTotal, targetAmount);
  const addPct = pctOf(amount, targetAmount);
  const nowWidth = clampPct(nowPct);
  const addWidth = clampPct(nowPct + addPct) - nowWidth;

  const presets = [
    { label: "1/4", value: Math.max(MIN_DONATION, toStep(max / 4)) },
    { label: "절반", value: Math.max(MIN_DONATION, toStep(max / 2)) },
    { label: "전액", value: max },
  ];

  return (
    <form action={formAction} className={styles.panel}>
      <input type="hidden" name="targetId" value={targetId} />

      <div className={styles.panelHead}>
        <h2 className={`${styles.panelTitle} ${display.className}`}>기부하기</h2>
        <p className={styles.panelBalance}>내 포인트 {pt(balance)}</p>
      </div>

      <label htmlFor="donation-amount" className={styles.amountLabel}>
        기부할 포인트
      </label>
      <output htmlFor="donation-amount" className={`${styles.amountValue} ${display.className}`}>
        {amount.toLocaleString("ko-KR")}
        <span className={styles.amountUnit}>P</span>
      </output>

      <input
        id="donation-amount"
        name="amount"
        type="range"
        className={styles.range}
        min={MIN_DONATION}
        max={max}
        step={DONATION_STEP}
        value={amount}
        onChange={(e) => setRawAmount(Number(e.target.value))}
        aria-valuetext={`${amount.toLocaleString("ko-KR")} 포인트`}
        style={{ "--pct": `${fillPct}%` } as React.CSSProperties}
      />
      <div className={styles.rangeScale} aria-hidden="true">
        <span>{pt(MIN_DONATION)}</span>
        <span>{pt(max)}</span>
      </div>

      <div className={styles.chips} role="group" aria-label="자주 쓰는 금액">
        {presets.map((p) => (
          <button
            key={p.label}
            type="button"
            className={styles.chip}
            aria-pressed={amount === p.value}
            onClick={() => setRawAmount(p.value)}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className={styles.preview}>
        <div className={styles.previewBar} aria-hidden="true">
          <div className={styles.previewNow} style={{ width: `${nowWidth}%` }} />
          <div className={styles.previewAdd} style={{ width: `${addWidth}%` }} />
        </div>
        <p className={styles.previewText}>
          지금 {formatPct(nowPct)}가 모였고, 이 기부로 {formatPct(addPct)}가 더 채워져요.
        </p>
        <p className={styles.previewText}>기부하면 내 포인트는 {pt(balance - amount)}가 돼요.</p>
      </div>

      {state.status === "error" && (
        <p className={styles.messageError} role="alert">
          {state.message}
        </p>
      )}
      {state.status === "success" && (
        <p className={styles.messageSuccess} role="status">
          {targetName}에 {pt(state.amount)}를 기부했어요. 고마워요! 남은 포인트는{" "}
          {pt(state.balance)}예요.
        </p>
      )}

      <button type="submit" className={styles.submit} disabled={isPending}>
        {isPending ? "기부하는 중이에요" : `${pt(amount)} 기부하기`}
      </button>
    </form>
  );
}
