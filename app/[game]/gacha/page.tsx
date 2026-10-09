import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";
import { GachaCalculator } from "@/components/GachaCalculator";

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
  return {
    title: `${g.name} 뽑기 확률 계산기`,
    description: `${g.name}의 뽑기 확률, 평균 획득 개수, 목표 확률에 필요한 횟수를 계산해보세요.`,
  };
}

export default async function GachaPage({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  return (
    <GachaCalculator
      ratePresets={g.ratePresets}
      triesPresets={g.triesPresets}
    />
  );
}
