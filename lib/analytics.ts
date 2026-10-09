/**
 * Google Analytics 4 helper.
 *
 * NEXT_PUBLIC_GA_MEASUREMENT_ID 환경변수가 설정되지 않으면 GA 스크립트는 렌더되지 않음.
 * Netlify 대시보드 → Environment variables 에서 Measurement ID (G-XXXXXXXXXX) 등록 후
 * 재배포하면 활성화됨.
 *
 * 로컬 개발에서는 env 미설정이 기본 — GA 없이 작동.
 */
export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID ?? "";

export function hasAnalytics(): boolean {
  return GA_MEASUREMENT_ID.length > 0;
}
