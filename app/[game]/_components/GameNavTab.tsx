"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  label: string;
};

// next.config.ts의 trailingSlash: true 전제. 설정 변경 시 활성 판정이 깨짐.
function normalize(path: string): string {
  if (!path) return "/";
  return path.endsWith("/") ? path : path + "/";
}

export function GameNavTab({ href, label }: Props) {
  const pathname = usePathname();
  const normalizedPath = normalize(pathname ?? "/");
  const normalizedHref = normalize(href);
  // NOTE: /{game}/ 랜딩에서는 어떤 탭도 active가 아님. 랜딩이 메뉴 허브라서
  // "선택 공허" 상태가 정직한 의도. aria-current를 거짓으로 설정하는 안티패턴 회피.
  const active =
    normalizedPath === normalizedHref ||
    normalizedPath.startsWith(normalizedHref);

  const base =
    "inline-flex min-h-11 items-center px-4 py-3 text-sm font-medium -mb-px border-b-2 transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]";
  const inactive =
    "text-[var(--color-ink)]/70 border-transparent hover:text-[var(--color-brand)] hover:border-[var(--color-brand)]/40";
  const activeCls =
    "text-[var(--color-brand)] border-[var(--color-brand)]";

  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={`${base} ${active ? activeCls : inactive}`}
    >
      {label}
    </Link>
  );
}
