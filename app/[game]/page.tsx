import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "@/data/games";

type Props = {
  params: Promise<{ game: string }>;
};

export default async function GameHome({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  return (
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
    </div>
  );
}
