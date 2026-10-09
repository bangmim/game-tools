import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GAMES, getGame } from "@/data/games";
import { Disclaimer } from "@/components/Disclaimer";
import { JsonLd } from "@/components/JsonLd";
import { SITE_NAME, SITE_URL } from "@/lib/site";

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
  const title = g.name;
  const description = `${g.name} 뽑기 확률 계산기와 공식 쿠폰 코드 모음. 1개 이상 나올 확률, 천장, 필요 재화까지 1분 안에 확인하세요.`;
  return {
    title,
    description,
    keywords: g.keywords,
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
          <h1 className="text-2xl font-bold">{g.name}</h1>
          <p className="mt-1 text-xs text-[var(--color-ink)]/60">
            {g.publisher} · {g.releasedAt} 출시
          </p>
          {g.tagline && (
            <p className="mt-3 text-sm text-[var(--color-ink)]/80">{g.tagline}</p>
          )}
        </header>

        <div className="mb-6 flex gap-2 border-b border-[var(--color-border)]">
          <TabLink href={`/${g.slug}/gacha/`}>뽑기 확률 계산기</TabLink>
          <TabLink href={`/${g.slug}/coupon/`}>쿠폰 모음</TabLink>
        </div>

        {children}
      </main>
      <Disclaimer />
    </>
  );
}

function TabLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--color-ink)]/70 transition hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
    >
      {children}
    </Link>
  );
}
