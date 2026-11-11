// app/donations/rules.ts
// 기부 포인트의 최소 금액과 단위예요. 슬라이더(화면)와 서버 검증이 같은 값을 쓰도록 한곳에 뒀어요.
// 팀에서 정한 값으로 바꾸세요. 백엔드(Spring)의 검증 규칙과 꼭 같아야 해요.

export const MIN_DONATION = 1_000; // 한 번에 기부할 수 있는 최소 포인트
export const DONATION_STEP = 1_000; // 슬라이더가 움직이는 단위
