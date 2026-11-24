import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GAMES, getGame } from "@/data/games";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";
import { hasBeginnerChecklist } from "@/data/games/beginner";
import { GameNavTab } from "./_components/GameNavTab";

export function generateStaticParams() {
  return GAMES.map((g) => ({ game: g.slug }));
}

type Props = {
  params: Promise<{ game: string }>;
  children: React.ReactNode;
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ game: string }>;
}): Promise<Metadata> {
  const { game } = await params;
  const g = getGame(game);
  if (!g) return {};
  const title = `${g.name} 쿠폰·뽑기 확률 도구`;
  const description = `${g.name}(${g.publisher}) 공식 쿠폰 출처와 입력 페이지, 뽑기 확률 계산기를 한곳에서 확인하세요.`;
  return {
    title,
    description,
    keywords: g.keywords,
    robots: g.indexable ? undefined : { index: false, follow: true },
    alternates: { canonical: `/${g.slug}/` },
    openGraph: {
      title: `${title} — ${SITE_NAME}`,
      description,
      url: `${SITE_URL}/${g.slug}/`,
    },
  };
}

export default async function GameLayout({ params, children }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

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
    ],
  };

  return (
    <>
      <JsonLd data={breadcrumb} />
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
        <nav className="mb-4 text-xs text-[var(--color-ink)]/60">
          <Link href="/" className="hover:text-[var(--color-brand)]">
            ← {SITE_NAME}
          </Link>
        </nav>
        <header className="mb-6">
          <Link href={`/${g.slug}/`} className="text-lg font-bold hover:text-[var(--color-brand)]">
            {g.name}
          </Link>
          <p className="mt-1 text-xs text-[var(--color-ink)]/60">
            {g.publisher} · {g.releasedAt} 출시
          </p>
        </header>

        <div className="mb-6 flex flex-wrap gap-2 border-b border-[var(--color-border)]">
          <GameNavTab href={`/${g.slug}/gacha/`} label="뽑기 확률 계산기" />
          <GameNavTab href={`/${g.slug}/coupon/`} label="쿠폰 모음" />
          {hasBeginnerChecklist(g.slug) && (
            <GameNavTab href={`/${g.slug}/beginner/`} label="초반 가이드" />
          )}
        </div>

        {children}
      </main>
      <Disclaimer />
    </>
  );
}
