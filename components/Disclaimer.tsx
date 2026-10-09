import Link from "next/link";

export function Disclaimer() {
  return (
    <footer className="mt-auto border-t border-[var(--color-border)] px-5 py-6 text-center text-xs leading-relaxed text-[var(--color-ink)]/60">
      <p>
        이 사이트는 팬이 만든 <b>비공식 도구</b>이며, 카카오게임즈 및 각 게임사의
        공식 사이트가 아닙니다.
      </p>
      <p className="mt-2">
        모든 상표권·저작권은 각 권리자에게 있습니다. 쿠폰 정보는 공식 공지를
        기반으로 수집되었으며, <b>최신성·유효성은 보증하지 않습니다</b>. 공식
        보상 수령은 공식 입력 페이지에서만 가능합니다.
      </p>
      <p className="mt-2">
        저작권·상표 관련 삭제 요청:{" "}
        <a
          href="mailto:akiyun10@gmail.com"
          className="text-[var(--color-brand)] underline-offset-2 hover:underline"
        >
          akiyun10@gmail.com
        </a>{" "}
        (접수 후 24시간 내 조치)
      </p>
      <p className="mt-3">
        <Link href="/privacy/" className="hover:text-[var(--color-brand)]">
          개인정보처리방침
        </Link>
      </p>
    </footer>
  );
}
