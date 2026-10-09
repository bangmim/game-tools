import { notFound } from "next/navigation";
import Link from "next/link";
import type { Metadata } from "next";
import { GAMES, getGame } from "@/data/games";
import { Disclaimer } from "@/components/Disclaimer";

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
  return {
    title: g.name,
    description: `${g.name}의 뽑기 확률 계산기와 쿠폰 모음.`,
    openGraph: {
      title: `${g.name} — 게임 도구`,
      description: `${g.name}의 뽑기 확률 계산기와 쿠폰 모음.`,
    },
  };
}

export default async function GameLayout({ params, children }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  return (
    <>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
        <nav className="mb-4 text-xs text-[var(--color-ink)]/60">
          <Link href="/" className="hover:text-[var(--color-brand)]">
            ← 게임 도구
          </Link>
        </nav>
        <header className="mb-6">
          <h1 className="text-2xl font-bold">{g.name}</h1>
          <p className="mt-1 text-xs text-[var(--color-ink)]/60">
            {g.publisher} · {g.releasedAt} 출시
          </p>
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
      className="-mb-px border-b-2 border-transparent px-3 py-2 text-sm font-medium text-[var(--color-ink)]/70 hover:border-[var(--color-brand)] hover:text-[var(--color-brand)]"
    >
      {children}
    </Link>
  );
}
