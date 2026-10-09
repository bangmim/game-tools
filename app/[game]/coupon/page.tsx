import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { GAMES, getGame } from "@/data/games";
import { CouponList } from "@/components/CouponList";
import { Faq } from "@/components/Faq";
import { SITE_URL } from "@/lib/site";

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
  const title = `${g.name} 쿠폰 모음`;
  const description = `${g.name} 공식 쿠폰 코드와 공식 입력 페이지 바로가기. 코드 복사 후 공식 페이지에서 등록하세요.`;
  return {
    title,
    description,
    keywords: [...g.keywords, `${g.name} 쿠폰 번호`, `${g.name} 쿠폰 입력`],
    alternates: { canonical: `/${g.slug}/coupon/` },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/${g.slug}/coupon/`,
    },
  };
}

export default async function CouponPage({ params }: Props) {
  const { game } = await params;
  const g = getGame(game);
  if (!g) notFound();

  return (
    <>
      <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]/60">
          쿠폰 입력 방법
        </h2>
        <ol className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--color-ink)]/80">
          <li>1. 아래 쿠폰 중 원하는 코드의 <b>복사</b> 버튼을 누릅니다.</li>
          <li>2. 공식 쿠폰 입력 페이지로 이동합니다.</li>
          <li>3. 복사한 코드를 붙여넣고 등록합니다. 지급은 보통 게임 우편함.</li>
        </ol>
        <p className="mt-3 text-xs text-[var(--color-ink)]/60">
          이 사이트는 쿠폰을 자동 등록하지 않습니다. 코드 복사와 공식 페이지
          링크만 제공합니다.
        </p>
      </section>

      <CouponList coupons={g.coupons} couponUrl={g.couponUrl} />

      <Faq
        title="자주 묻는 질문"
        items={[
          {
            q: "쿠폰은 어디서 입력하나요?",
            a: g.couponUrl
              ? "상단의 '공식 쿠폰 입력 페이지' 버튼을 누르면 공식 사이트로 이동합니다. 로그인 후 코드를 입력하면 게임 우편함으로 보상이 지급됩니다."
              : "현재 공식 쿠폰 입력 페이지 주소가 확인되지 않았습니다. 확인되는 대로 반영합니다.",
          },
          {
            q: "복사한 쿠폰이 등록되지 않아요.",
            a: "쿠폰이 만료되었거나, 이미 등록한 계정일 수 있습니다. 또한 쿠폰은 대소문자를 구분합니다. 공백 없이 그대로 붙여넣었는지 확인하세요.",
          },
          {
            q: "쿠폰이 공개된 걸 어떻게 아나요?",
            a: "공식 공지, 라이브 방송, 커뮤니티 모니터링으로 수집합니다. 발견된 쿠폰은 가능한 한 빨리 반영하지만, 사이트 반영 전에 공식 공지가 더 빠를 수 있습니다.",
          },
        ]}
      />
    </>
  );
}
