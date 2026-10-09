import Link from "next/link";

export function Disclaimer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] px-5 py-4 text-center text-xs text-[var(--color-ink)]/60">
      <p>이 사이트는 팬이 만든 비공식 도구이며, 게임사와 관련이 없습니다.</p>
      <p className="mt-1">
        <Link href="/privacy/" className="hover:text-[var(--color-brand)]">
          개인정보처리방침
        </Link>
      </p>
    </footer>
  );
}
