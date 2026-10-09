import Link from "next/link";
import { GAMES } from "@/data/games";
import { Disclaimer } from "@/components/Disclaimer";

export default function Home() {
  return (
    <>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
        <section className="rounded-2xl bg-gradient-to-br from-[var(--color-brand)] to-[#4958db] px-6 py-10 text-white">
          <p className="text-xs font-medium tracking-wider text-[var(--color-accent)]">
            팬이 만든 비공식 도구
          </p>
          <h1 className="mt-2 text-3xl font-bold leading-tight sm:text-4xl">
            뽑기 10만원 쓰기 전,
            <br />
            1분 확인
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/80">
            신작 모바일 게임의 뽑기 확률과 공식 쿠폰을 한곳에서. 광고 적게,
            숫자 중심.
          </p>
        </section>

        <section className="mt-8">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]/60">
            왜 이 사이트?
          </h2>
          <ul className="grid gap-3 sm:grid-cols-3">
            <WhyCard
              title="광고가 적어요"
              body="알림만 쓰고 지우고 싶지 않도록, 광고는 최소한만."
            />
            <WhyCard
              title="숫자만 보여줘요"
              body="게임 이미지·로고 없이 수치와 공식만. 가볍고 빠릅니다."
            />
            <WhyCard
              title="공식 쿠폰 바로가기"
              body="쿠폰 코드를 복사해 공식 입력 페이지로 바로 이동합니다."
            />
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]/60">
            지원 게임
          </h2>
          <ul className="space-y-3">
            {GAMES.map((g) => (
              <li key={g.slug}>
                <Link
                  href={`/${g.slug}/`}
                  className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-white px-4 py-4 transition hover:border-[var(--color-brand)] hover:shadow-sm"
                >
                  <div>
                    <div className="font-semibold">{g.name}</div>
                    <div className="mt-1 text-xs text-[var(--color-ink)]/60">
                      {g.publisher} · {g.releasedAt} 출시
                    </div>
                  </div>
                  <span className="text-[var(--color-brand)]">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-10">
          <h2 className="mb-3 text-sm font-semibold text-[var(--color-ink)]/60">
            이 사이트에서 할 수 있는 것
          </h2>
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm leading-relaxed">
            <p>
              뽑기 확률을 입력하면 <b>1개 이상 나올 확률</b>, <b>평균 획득 개수</b>,
              <b> 50·90·99% 목표에 도달하는 데 필요한 횟수</b>를 계산합니다.
              천장이 있는 게임은 천장 횟수를, 재화 비용을 알면 1회 비용을 넣어
              <b> 목표 확률에 필요한 재화</b>까지 확인할 수 있습니다.
            </p>
            <p className="mt-3 text-[var(--color-ink)]/70">
              쿠폰은 게임별 공식 쿠폰 코드를 모아 복사 버튼과 공식 입력
              페이지 링크를 제공합니다. 자동 등록은 하지 않습니다.
            </p>
          </div>
        </section>
      </main>
      <Disclaimer />
    </>
  );
}

function WhyCard({ title, body }: { title: string; body: string }) {
  return (
    <li className="rounded-xl border border-[var(--color-border)] bg-white p-4">
      <div className="text-sm font-semibold">{title}</div>
      <p className="mt-2 text-xs leading-relaxed text-[var(--color-ink)]/70">
        {body}
      </p>
    </li>
  );
}
