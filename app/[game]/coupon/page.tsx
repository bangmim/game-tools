import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";
import { CouponList } from "@/components/CouponList";

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
    title: `${g.name} 쿠폰 모음`,
    description: `${g.name}의 공개 쿠폰 코드와 공식 입력 페이지 바로가기.`,
  };
}

export default async function CouponPage({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  return <CouponList coupons={g.coupons} couponUrl={g.couponUrl} />;
}
