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
          <div className="mb-3 flex items-baseline justify-between">
            <h2 className="text-base font-semibold text-[var(--color-ink)]">
              지원 게임
            </h2>
            <span className="text-xs text-[var(--color-ink)]/60">
              {GAMES.length}개
            </span>
          </div>
          <ul className="grid gap-3 sm:grid-cols-2">
            {GAMES.map((g) => {
              // TODO(data-model): "예정" 문자열 매칭은 fragile. types.ts에
              // status: "released" | "upcoming" 필드 추가되면 교체.
              const upcoming = g.releasedAt.includes("예정");
              // TODO(coupon-count): 만료 쿠폰 제외 로직 필요. CouponList의
              // active/expired 분리 카운트와 불일치 가능. 현재 dokkaebi는 전부
              // expiresAt=null이라 noop.
              const couponCount = g.coupons.length;
              return (
                <li key={g.slug}>
                  <Link
                    href={`/${g.slug}/`}
                    className="group flex h-full flex-col rounded-xl border border-[var(--color-border)] bg-white p-4 transition hover:border-[var(--color-brand)] hover:shadow-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span
                        aria-hidden="true"
                        className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-bg)] text-base font-bold text-[var(--color-brand)]"
                      >
                        {g.name.charAt(0)}
                      </span>
                      {upcoming ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-accent)]/20 px-2 py-0.5 text-xs font-medium text-[var(--color-ink)]">
                          출시 예정
                        </span>
                      ) : couponCount > 0 ? (
                        <span className="inline-flex items-center rounded-full bg-[var(--color-brand)] px-2 py-0.5 text-xs font-medium text-white">
                          쿠폰 {couponCount}개
                        </span>
                      ) : null}
                    </div>
                    <div className="mt-3">
                      <div className="text-base font-semibold">{g.name}</div>
                      <div className="mt-1 text-xs text-[var(--color-ink)]/60">
                        {g.publisher} · {g.releasedAt} 출시
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between text-sm text-[var(--color-brand)]">
                      <span>계산기 · 쿠폰 보기</span>
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:translate-x-1"
                      >
                        →
                      </span>
                    </div>
                  </Link>
                </li>
              );
            })}
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
