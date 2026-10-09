import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "@/data/games";
import { Faq } from "@/components/Faq";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import {
  beginnerChecklistSlugs,
  getBeginnerChecklist,
} from "@/data/games/beginner";

export const dynamic = "force-static";

export function generateStaticParams() {
  return beginnerChecklistSlugs().map((slug) => ({ game: slug }));
}

type Props = {
  params: Promise<{ game: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { game } = await params;
  const g = getGame(game);
  if (!g) return {};
  const title = `${g.name} 초반 체크리스트`;
  const description = `${g.name} 초반에 뭐부터 챙겨야 하는지 체크리스트로 정리. 공식 공지와 언론 가이드 기준, 접속 당일·첫 주 할 일을 짧게.`;
  return {
    title,
    description,
    keywords: [
      ...g.keywords,
      `${g.name} 초반`,
      `${g.name} 공략`,
      `${g.name} 뉴비`,
      `${g.name} 가이드`,
      `${g.name} 뭐부터`,
      `${g.name} 체크리스트`,
    ],
    alternates: { canonical: `/${g.slug}/beginner/` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${g.slug}/beginner/`,
    },
  };
}

export default async function BeginnerPage({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();
  const data = getBeginnerChecklist(g.slug);
  if (!data) notFound();

  // 부모 layout의 BreadcrumbList(2단계)에 더해, 이 페이지는 3단계 breadcrumb를 추가로 선언.
  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: SITE_NAME,
        item: SITE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: g.name,
        item: `${SITE_URL}/${g.slug}/`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: "초반 체크리스트",
        item: `${SITE_URL}/${g.slug}/beginner/`,
      },
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />

      <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]/60">
          초반 체크리스트
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-[var(--color-ink)]/80">
          {data.intro}
        </p>
      </section>

      <div className="space-y-4">
        {data.sections.map((section) => (
          <section
            key={section.title}
            className="rounded-xl border border-[var(--color-border)] bg-white p-5"
          >
            <h3 className="text-base font-semibold">{section.title}</h3>
            <ul className="mt-3 space-y-2 text-sm leading-relaxed text-[var(--color-ink)]/80">
              {section.items.map((item) => (
                <li key={item} className="flex gap-2">
                  <span
                    aria-hidden
                    className="mt-[0.4rem] inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-brand)]"
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
            {section.note && (
              <p className="mt-3 rounded-md bg-[var(--color-ink)]/5 px-3 py-2 text-xs leading-relaxed text-[var(--color-ink)]/70">
                {section.note}
              </p>
            )}
          </section>
        ))}
      </div>

      <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h3 className="text-sm font-semibold text-[var(--color-ink)]/60">
          참고한 공식·언론 자료
        </h3>
        <ul className="mt-2 space-y-1 text-sm">
          {data.sources.map((src) => (
            <li key={src.url}>
              <a
                href={src.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-brand)] underline-offset-2 hover:underline"
              >
                {src.label} →
              </a>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <Link
          href={`/${g.slug}/gacha/`}
          className="rounded-xl border border-[var(--color-border)] bg-white p-4 hover:border-[var(--color-brand)]"
        >
          <div className="text-sm font-semibold">뽑기 확률 계산기</div>
          <div className="mt-1 text-xs text-[var(--color-ink)]/60">
            공식 확률 공시 그대로 넣어 1개 이상 나올 확률·천장을 확인.
          </div>
        </Link>
        <Link
          href={`/${g.slug}/coupon/`}
          className="rounded-xl border border-[var(--color-border)] bg-white p-4 hover:border-[var(--color-brand)]"
        >
          <div className="text-sm font-semibold">쿠폰 모음</div>
          <div className="mt-1 text-xs text-[var(--color-ink)]/60">
            공개된 쿠폰을 복사해 공식 입력 페이지로 바로.
          </div>
        </Link>
      </div>

      <Faq
        title="자주 묻는 질문"
        items={[
          {
            q: `${g.name}, 뭐부터 키우면 되나요?`,
            a: "출시 극초반이라 '어느 캐릭터·도술 몰빵' 식의 정답은 아직 커뮤니티에 쌓이지 않았습니다. 대신 서사 임무(메인 퀘스트)와 문파 가입을 먼저 끝내는 쪽이 안전합니다 — 초반 성장 재화 대부분이 여기서 나오고, 문파 영기 수련 지원만으로도 하루 성장량 자체가 바뀝니다.",
          },
          {
            q: "쿠폰은 꼭 등록해야 하나요?",
            a: "네, 가능한 전부 등록을 권장합니다. 출시 기념 쿠폰은 성장 재화·외형·칭호가 섞여 있어 초반 체감이 큽니다. 상단 '쿠폰 모음' 메뉴에서 공개 쿠폰과 공식 입력 페이지 링크를 바로 쓸 수 있습니다.",
          },
          {
            q: "과금 꼭 해야 하나요?",
            a: "현재까지 공개된 설계상 꾸미기(의복·탈것)에는 성장 능력치가 붙지 않고, 장비 파괴 없는 강화라 성장을 완전히 무과금으로 끌고 가는 설계가 가능합니다. 유료 상품은 멤버십(30일)과 배틀패스가 중심이라 '지금 당장 지를지'는 며칠 플레이한 뒤 판단해도 늦지 않습니다.",
          },
          {
            q: "직업이 없다는데 전투 스타일은 어떻게 정하나요?",
            a: "고정 직업 대신 '도술' 12계열에서 조합을 짜는 구조입니다. 8개 슬롯에 같은 계열 3개를 넣으면 궁극기가 열립니다. 콘텐츠별로 조합을 바꿀 수 있어, 처음 고른 계열에 묶이지 않습니다. 구체 추천은 공식·커뮤니티 메타가 쌓이는 대로 이 페이지에 반영할 예정입니다.",
          },
          {
            q: "이 가이드는 공식인가요?",
            a: "아니요. 이 사이트는 팬이 만든 비공식 도구이며, 위 체크리스트는 공식 커뮤니티·언론 가이드를 요약해 재구성한 것입니다. 최종 수치나 공지는 반드시 공식 페이지(상단 링크)에서 다시 확인하세요.",
          },
        ]}
      />
    </>
  );
}
