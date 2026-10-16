import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";
import { GachaCalculator } from "@/components/GachaCalculator";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { gacha } from "@/lib/gacha";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.slug }));
}

type Props = {
  params: Promise<{ game: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game } = await params;
  const g = getGame(game);
  if (!g) return {};
  const title = `${g.name} 뽑기 확률 계산기`;
  const description = `${g.name} 뽑기 확률을 1개 이상 나올 확률, 천장 없는 평균 획득 개수, 50·90·99% 목표에 필요한 횟수로 계산합니다. 천장은 첫 획득 보장만 반영하며 1회 비용도 계산합니다.`;
  return {
    title,
    description,
    keywords: [...g.keywords, `${g.name} 천장`, `${g.name} 확률`, "가챠 확률 계산"],
    alternates: { canonical: `/${g.slug}/gacha/` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${g.slug}/gacha/`,
    },
  };
}

export default async function GachaPage({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  const example = gacha({ ratePercent: 1, tries: 100 });

  const webApp = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: `${g.name} 뽑기 확률 계산기`,
    url: `${SITE_URL}/${g.slug}/gacha/`,
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: 0, priceCurrency: "KRW" },
    inLanguage: "ko-KR",
    isPartOf: { "@type": "WebSite", name: SITE_NAME, url: SITE_URL },
  };

  return (
    <>
      <JsonLd data={webApp} />

      <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]/60">
          이렇게 쓰세요
        </h2>
        <ol className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--color-ink)]/80">
          <li>
            1. 공식 공지에서 뽑기 <b>확률(%)</b>을 확인해 입력합니다.
          </li>
          <li>
            2. 뽑으려는 <b>횟수</b>를 넣으면 결과가 자동으로 계산됩니다.
          </li>
          <li>
            3. 천장(확정 지급 횟수)이 있으면 입력, 1회 비용을 넣으면 필요 재화도
            보여줍니다.
          </li>
        </ol>
        {g.probabilityUrl && (
          <a
            href={g.probabilityUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex min-h-11 items-center gap-1.5 rounded-md border-2 border-[var(--color-brand)] bg-white px-4 py-2 text-sm font-medium text-[var(--color-brand)] transition hover:bg-[var(--color-brand)] hover:text-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-brand)]"
          >
            {g.name} 공식 확률 공시
            {/* TODO(icon): CouponList.tsx의 ExternalLinkIcon과 동일 path. 사용처 3곳 되면 components/icons/로 추출. */}
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
          </a>
        )}
      </section>

      <GachaCalculator
        ratePresets={g.ratePresets}
        triesPresets={g.triesPresets}
      />

      <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm leading-relaxed">
        <h2 className="font-semibold">계산 결과 읽기: 가상 확률 1%로 100회 뽑는다면</h2>
        <p className="mt-2 text-xs text-[var(--color-ink)]/60">게임의 공식 확률이 아닌 설명용 예시입니다. 매회 확률이 같고 서로 독립이며 천장은 없다고 가정합니다. 위 입력값과 별개입니다.</p>
        <dl className="mt-3 grid grid-cols-2 gap-3 rounded-lg bg-[var(--color-bg)] p-3">
          <div><dt className="text-xs text-[var(--color-ink)]/60">1개 이상 획득</dt><dd className="font-semibold">{(example.atLeastOne * 100).toFixed(2)}%</dd></div>
          <div><dt className="text-xs text-[var(--color-ink)]/60">한 번도 획득하지 못함</dt><dd className="font-semibold">{(example.none * 100).toFixed(2)}%</dd></div>
        </dl>
        <p className="mt-3">평균 획득 개수는 {example.expected.toFixed(0)}개지만, 100회마다 반드시 1개를 받는다는 뜻은 아닙니다. 같은 조건의 뽑기를 여러 번 반복했을 때 획득 개수의 평균이며, 한 번의 100회에서는 0개 또는 여러 개가 나올 수 있습니다.</p>
        <p className="mt-3">최소 1개 획득할 목표 확률에 필요한 횟수는 다음과 같습니다. 이 횟수도 확정 지급을 뜻하지 않습니다.</p>
        <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1">
          {[0.5, 0.9, 0.99].map((target) => <li key={target}>{target * 100}%: <b>{example.needForTarget(target)}회</b></li>)}
        </ul>
        <p className="mt-3 text-[var(--color-ink)]/80">천장을 입력하면 첫 획득까지의 보장만 계산합니다. 획득 후 천장 초기화나 이월은 반영하지 않으므로 평균 획득 개수는 표시하지 않습니다. 실제 적용 전 게임의 공식 확률과 천장 규칙을 확인하세요.</p>
      </section>

      <Faq
        title="자주 묻는 질문"
        items={[
          {
            q: "1개 이상 나올 확률은 어떻게 계산하나요?",
            a: "1 - (1 - p)^n 공식입니다. p는 1회 확률, n은 뽑기 횟수입니다. 예를 들어 1% 확률을 100번 뽑으면 1 - 0.99^100 ≈ 63.4%가 나옵니다.",
          },
          {
            q: "천장은 뭘 뜻하나요?",
            a: "첫 획득까지 지정된 횟수에서 확정 지급되는 단순 보장 모델입니다. 획득 후 초기화·이월 규칙은 반영하지 않으며 천장 적용 시 평균 획득 개수는 계산하지 않습니다. 입력하면 결과 횟수가 천장 이상이 될 때 100% 확률로 처리되고, 목표 확률에 필요한 횟수도 천장을 넘지 않도록 제한됩니다.",
          },
          {
            q: "1회 비용을 넣으면 뭐가 바뀌나요?",
            a: "현재 횟수의 총 비용과 50·90·99% 목표에 도달하는 데 필요한 재화량을 함께 보여줍니다. 다이아·크리스탈 등 게임 재화 단위에 맞춰 입력하세요.",
          },
          {
            q: "확률 공지가 실제와 다를 수 있지 않나요?",
            a: "확률 공시는 운영사가 발표한 값을 기준으로 합니다. 실제 체감은 소수의 시행에서는 공식 확률과 크게 다를 수 있고, 횟수가 늘수록 공시값에 수렴합니다. 이 도구는 공시값 기준의 수학적 기댓값만 계산합니다.",
          },
        ]}
      />
    </>
  );
}
