import type { Coupon } from "@/data/games/types";

export function splitCoupons(coupons: Coupon[], now: number) {
  const expired = coupons.filter((c) => c.expiresAt && Date.parse(c.expiresAt) <= now);
  const active = coupons.filter((c) => !expired.includes(c));
  active.sort((a, b) => (a.expiresAt ? Date.parse(a.expiresAt) : Infinity) - (b.expiresAt ? Date.parse(b.expiresAt) : Infinity));
  return { active, expired };
}

// expiresAt is an exclusive deadline; display the final valid minute.
export function formatExpiry(expiresAt: string): string {
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", hourCycle: "h23",
  }).format(new Date(Date.parse(expiresAt) - 1)) + " (한국 시간)";
}
