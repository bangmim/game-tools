import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";
import { GachaCalculator } from "@/components/GachaCalculator";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
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
  const description = `${g.name} 뽑기 확률을 1개 이상 나올 확률, 평균 획득 개수, 50·90·99% 목표에 도달하는 데 필요한 횟수로 계산합니다. 천장과 1회 비용도 반영.`;
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
      </section>

      <GachaCalculator
        ratePresets={g.ratePresets}
        triesPresets={g.triesPresets}
      />

      <Faq
        title="자주 묻는 질문"
        items={[
          {
            q: "1개 이상 나올 확률은 어떻게 계산하나요?",
            a: "1 - (1 - p)^n 공식입니다. p는 1회 확률, n은 뽑기 횟수입니다. 예를 들어 1% 확률을 100번 뽑으면 1 - 0.99^100 ≈ 63.4%가 나옵니다.",
          },
          {
            q: "천장은 뭘 뜻하나요?",
            a: "지정된 횟수까지 못 뽑으면 확정으로 지급되는 보장 횟수입니다. 입력하면 결과 횟수가 천장 이상이 될 때 100% 확률로 처리되고, 목표 확률에 필요한 횟수도 천장을 넘지 않도록 제한됩니다.",
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
