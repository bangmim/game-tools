import { CopyButton } from "./CopyButton";
import type { Coupon } from "@/data/games/types";

function ExternalLinkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 16 16"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9.5 2.5h4v4" />
      <path d="M13.5 2.5 7 9" />
      <path d="M12 9.5v3A1 1 0 0 1 11 13.5H3.5A1 1 0 0 1 2.5 12.5V5A1 1 0 0 1 3.5 4h3" />
    </svg>
  );
}

type Props = {
  coupons: Coupon[];
  couponUrl: string | null;
};

function daysLeft(expiresAt: string | null): number | null {
  if (!expiresAt) return null;
  const expiry = new Date(expiresAt).getTime();
  const now = Date.now();
  const diff = Math.ceil((expiry - now) / (1000 * 60 * 60 * 24));
  return diff;
}

function sortCoupons(coupons: Coupon[]): { active: Coupon[]; expired: Coupon[] } {
  const now = Date.now();
  const active: Coupon[] = [];
  const expired: Coupon[] = [];
  for (const c of coupons) {
    if (c.expiresAt && new Date(c.expiresAt).getTime() < now) {
      expired.push(c);
    } else {
      active.push(c);
    }
  }
  active.sort((a, b) => {
    if (!a.expiresAt) return 1;
    if (!b.expiresAt) return -1;
    return new Date(a.expiresAt).getTime() - new Date(b.expiresAt).getTime();
  });
  return { active, expired };
}

export function CouponList({ coupons, couponUrl }: Props) {
  if (coupons.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--color-border)] bg-white p-6 text-center text-sm text-[var(--color-ink)]/60">
        <p>아직 수집된 쿠폰이 없습니다.</p>
        {couponUrl && (
          <a
            href={couponUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md border-2 border-[var(--color-brand)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-brand)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] sm:w-auto"
          >
            공식 쿠폰 입력 페이지로 이동
            <ExternalLinkIcon />
          </a>
        )}
      </div>
    );
  }

  const { active, expired } = sortCoupons(coupons);

  return (
    <div className="space-y-6">
      {couponUrl && (
        <a
          href={couponUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-11 w-full items-center justify-center gap-1.5 rounded-md bg-[var(--color-brand)] px-4 py-2 text-sm font-medium text-white transition hover:bg-[var(--color-ink)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)] sm:w-auto"
        >
          공식 쿠폰 입력 페이지
          <ExternalLinkIcon />
        </a>
      )}

      <ul className="space-y-3">
        {active.map((c) => {
          const left = daysLeft(c.expiresAt);
          const urgent = left !== null && left <= 3;
          return (
            <li
              key={c.code}
              className="rounded-xl border border-[var(--color-border)] bg-white p-4"
            >
              <div className="flex items-center justify-between gap-3">
                <code className="rounded bg-[var(--color-bg)] px-2 py-1 font-mono text-sm">
                  {c.code}
                </code>
                <CopyButton code={c.code} />
              </div>
              <div className="mt-2 text-sm">{c.reward}</div>
              {c.expiresAt && (
                <div
                  className={
                    urgent
                      ? "mt-1 text-xs font-semibold text-red-600"
                      : "mt-1 text-xs text-[var(--color-ink)]/60"
                  }
                >
                  {urgent ? `마감 ${left}일 남음` : `~${c.expiresAt}`}
                </div>
              )}
              {!c.expiresAt && (
                <div className="mt-1 text-xs text-[var(--color-ink)]/60">
                  기간 제한 없음
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {expired.length > 0 && (
        <details className="rounded-xl border border-[var(--color-border)] bg-white p-4">
          <summary className="cursor-pointer text-sm text-[var(--color-ink)]/60">
            만료된 쿠폰 {expired.length}개
          </summary>
          <ul className="mt-3 space-y-2">
            {expired.map((c) => (
              <li key={c.code} className="text-sm text-[var(--color-ink)]/50">
                <code className="font-mono">{c.code}</code> — {c.reward} (만료)
              </li>
            ))}
          </ul>
        </details>
      )}
    </div>
  );
}
