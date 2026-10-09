import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";

export const metadata = {
  title: "페이지를 찾을 수 없음",
  description: "요청하신 페이지를 찾을 수 없습니다.",
};

export default function NotFound() {
  return (
    <>
      <main className="mx-auto flex w-full max-w-xl flex-1 flex-col items-center justify-center px-5 py-20 text-center">
        <div className="text-xs font-medium tracking-wider text-[var(--color-brand)]">
          404
        </div>
        <h1 className="mt-3 text-3xl font-bold">페이지를 찾을 수 없습니다</h1>
        <p className="mt-3 max-w-sm text-sm leading-relaxed text-[var(--color-ink)]/70">
          주소가 바뀌었거나, 사라진 페이지일 수 있어요. 지원 게임 목록으로
          돌아가서 다시 찾아보세요.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-[var(--color-brand)] bg-[var(--color-brand)] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2c38a8]"
        >
          홈으로 돌아가기
        </Link>
      </main>
      <Disclaimer />
    </>
  );
}
