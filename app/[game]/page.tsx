import Link from "next/link";
import { notFound } from "next/navigation";
import { getGame } from "@/data/games";
import { hasBeginnerChecklist } from "@/data/games/beginner";

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
  );
}
