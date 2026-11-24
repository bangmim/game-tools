import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "@/data/games";
import { hasBeginnerChecklist } from "@/data/games/beginner";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

type Props = {
  params: Promise<{ game: string }>;
};

export default async function GameHome({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  const description = `${g.name} 공식 쿠폰 출처와 입력 페이지, 뽑기 확률 계산기를 한곳에서 확인합니다.`;
  const latestCouponCheck = g.coupons
    .map((coupon) => coupon.verifiedAt)
    .filter((date): date is string => Boolean(date))
    .sort()
    .at(-1);
  const webPage = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: `${g.name} 쿠폰·뽑기 확률 도구`,
    description,
    url: `${SITE_URL}/${g.slug}/`,
    inLanguage: "ko-KR",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
    about: {
      "@type": "VideoGame",
      name: g.name,
      publisher: { "@type": "Organization", name: g.publisher },
      datePublished: g.releasedAt,
    },
  };

  return (
    <div>
      <JsonLd data={webPage} />
      <section className="mb-6">
        <h1 className="text-2xl font-bold">{g.name} 쿠폰·뽑기 확률 도구</h1>
        {g.tagline && <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/80">{g.tagline}</p>}
        <p className="mt-3 text-sm leading-relaxed text-[var(--color-ink)]/70">{description}</p>
        {latestCouponCheck && (
          <p className="mt-2 text-xs text-[var(--color-ink)]/60">쿠폰 공식 출처 최종 확인: <time dateTime={latestCouponCheck}>{latestCouponCheck}</time></p>
        )}
      </section>

      <div className="space-y-3">
      <Link
        href={`/${g.slug}/gacha/`}
        className="block rounded-xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-brand)]"
      >
        <div className="font-semibold">뽑기 확률 계산기</div>
        <div className="mt-1 text-sm text-[var(--color-ink)]/60">
          확률과 횟수를 넣으면 1개 이상 나올 확률, 평균 획득 개수, 목표 확률에
          필요한 횟수를 계산해줍니다.
        </div>
      </Link>
      <Link
        href={`/${g.slug}/coupon/`}
        className="block rounded-xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-brand)]"
      >
        <div className="font-semibold">쿠폰 모음</div>
        <div className="mt-1 text-sm text-[var(--color-ink)]/60">
          공개된 쿠폰을 한 곳에서 복사하고, 공식 입력 페이지로 이동합니다.
        </div>
      </Link>
      {hasBeginnerChecklist(g.slug) && (
        <Link
          href={`/${g.slug}/beginner/`}
          className="block rounded-xl border border-[var(--color-border)] bg-white p-5 hover:border-[var(--color-brand)]"
        >
          <div className="font-semibold">초반 체크리스트</div>
          <div className="mt-1 text-sm text-[var(--color-ink)]/60">
            &quot;뭐부터 키워야 함?&quot; 질문용. 접속 당일·첫 주 할 일을 공식·언론
            가이드 기준으로 짧게 정리했습니다.
          </div>
        </Link>
      )}
      </div>

      <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold">정보 확인 기준</h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/70">
          쿠폰은 각 코드의 공식 공지 링크를 함께 표시하고, 계산기에 넣는 확률과 천장 규칙은 운영사의 최신 공시를 먼저 확인해야 합니다.
        </p>
        <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          {g.probabilityUrl && <a href={g.probabilityUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] underline-offset-2 hover:underline">공식 확률 공시 ↗</a>}
          {g.couponUrl && <a href={g.couponUrl} target="_blank" rel="noopener noreferrer" className="text-[var(--color-brand)] underline-offset-2 hover:underline">공식 쿠폰 입력 페이지 ↗</a>}
        </div>
      </section>
    </div>
  );
}
