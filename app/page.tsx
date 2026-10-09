import Link from "next/link";
import { GAMES } from "@/data/games";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-12">
        <header className="mb-10">
          <h1 className="text-3xl font-bold">게임 도구</h1>
          <p className="mt-2 text-sm text-[var(--color-ink)]/70">
            신작 모바일 게임의 뽑기 확률을 계산하고, 쿠폰을 한곳에서 확인하세요.
          </p>
        </header>

        <section>
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]/60">
            지원 게임
          </h2>
          <ul className="space-y-3">
            {GAMES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/${g.slug}/`}
                  className="block rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 hover:border-[var(--color-brand)]"
                >
                  <div className="font-semibold">{g.name}</div>
                  <div className="mt-1 text-xs text-[var(--color-ink)]/60">
                    {g.publisher} · {g.releasedAt} 출시
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <Disclaimer />
    </>
  );
}
