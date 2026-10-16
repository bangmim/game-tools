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

  const isDokkaebi = g.slug === "dokkaebi";

  return (
    <>
      <section className="mb-6 rounded-xl border border-[var(--color-border)] bg-white p-5">
        <h2 className="text-sm font-semibold text-[var(--color-ink)]/60">
          쿠폰 입력 방법
        </h2>
        <ol className="mt-2 space-y-1 text-sm leading-relaxed text-[var(--color-ink)]/80">
          <li>1. 아래 쿠폰 중 원하는 코드의 <b>복사</b> 버튼을 누릅니다.</li>
          <li>2. 공식 쿠폰 입력 페이지로 이동합니다.</li>
          {isDokkaebi ? <>
            <li>3. 게임 내 설정에서 회원번호를 확인해 공식 페이지의 <b>회원 번호</b> 칸에 입력합니다.</li>
            <li>4. <b>쿠폰 코드</b> 칸에 복사한 코드를 넣고 <b>쿠폰 사용</b>을 누릅니다.</li>
            <li>5. 보상은 게임 내 우편함에서 확인합니다.</li>
          </> : <li>3. 입력 항목과 지급 방법은 해당 게임의 공식 안내를 확인하세요.</li>}
        </ol>
        <p className="mt-3 text-xs text-[var(--color-ink)]/60">
          이 사이트는 쿠폰을 자동 등록하지 않습니다. 코드 복사와 공식 페이지
          링크만 제공합니다.
        </p>
      </section>

      <CouponList coupons={g.coupons} couponUrl={g.couponUrl} />

      {isDokkaebi && (
        <section className="mt-6 rounded-xl border border-[var(--color-border)] bg-white p-5 text-sm leading-relaxed">
          <h2 className="font-semibold">등록 전에 확인할 것</h2>
          <ul className="mt-2 list-inside list-disc space-y-2 text-[var(--color-ink)]/80">
            <li>쿠폰마다 사용 기간이 다릅니다. 목록의 한국 시간 마감과 공식 공지의 최신 내용을 확인하세요. 사용 기간이 끝난 코드는 사용할 수 없습니다.</li>
            <li>공식 입력 페이지는 이미 사용한 쿠폰을 다시 등록할 수 없다고 안내합니다. 회원번호와 쿠폰 코드가 의도한 값인지 다시 확인하세요.</li>
            <li>계정에서 사용할 수 없다는 안내가 나오면 임의로 조건을 추측하지 말고 공식 공지의 쿠폰별 안내를 확인하세요. 이 사이트에서는 계정별 사용 가능 여부를 조회할 수 없습니다.</li>
          </ul>
          <p className="mt-3 text-xs text-[var(--color-ink)]/60">공식 안내 확인: 2026-10-16</p>
          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-[var(--color-brand)]">
            <a href="https://coupon.kakaogames.com/dokkaebi/ko/" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">공식 입력 페이지·주의사항 ↗</a>
            <a href="https://forum.kakaogames.com/dokkaebi/postView/?code=notice&id=13991" target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">공식 쿠폰 종합 안내 ↗</a>
          </div>
        </section>
      )}


      <Faq
        title="자주 묻는 질문"
        items={[
          {
            q: "쿠폰은 어디서 입력하나요?",
            a: g.couponUrl
              ? "상단의 '공식 쿠폰 입력 페이지' 버튼을 누르면 공식 사이트로 이동합니다. 입력 항목과 지급 방법은 공식 페이지의 안내를 따르세요."
              : "현재 공식 쿠폰 입력 페이지 주소가 확인되지 않았습니다. 확인되는 대로 반영합니다.",
          },
          {
            q: "복사한 쿠폰이 등록되지 않아요.",
            a: isDokkaebi
              ? "먼저 공식 공지의 사용 기간을 확인하세요. 이미 사용한 쿠폰은 다시 등록할 수 없습니다. 공식 입력 페이지의 회원번호와 코드를 다시 확인하고, 오류 메시지와 쿠폰별 공식 안내를 함께 살펴보세요."
              : "게임별 등록 조건과 오류 안내는 공식 공지에서 확인하세요. 공식 입력 페이지 주소가 없는 경우 확인되는 대로 반영합니다.",
          },
          {
            q: "쿠폰이 공개된 걸 어떻게 아나요?",
            a: "공식 공지에서 확인한 쿠폰만 등재하고 각 코드에 공식 출처를 연결합니다. 사이트 목록은 배포 시 반영되므로 최신 쿠폰과 변경 사항은 공식 공지도 함께 확인하세요.",
          },
        ]}
      />
    </>
  );
}
