import type { Metadata } from "next";
import Link from "next/link";
import { Disclaimer } from "@/components/Disclaimer";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = {
  title: "개인정보처리방침",
  description: `${SITE_NAME}의 개인정보 수집·이용·제3자 제공 방침.`,
  alternates: { canonical: "/privacy/" },
  robots: { index: true, follow: true },
};

const LAST_UPDATED = "2026-10-09";

export default function PrivacyPage() {
  return (
    <>
      <main className="mx-auto w-full max-w-xl flex-1 px-5 py-10">
        <nav className="mb-4 text-xs text-[var(--color-ink)]/60">
          <Link href="/" className="hover:text-[var(--color-brand)]">
            ← {SITE_NAME}
          </Link>
        </nav>

        <header className="mb-6">
          <h1 className="text-2xl font-bold">개인정보처리방침</h1>
          <p className="mt-1 text-xs text-[var(--color-ink)]/60">
            최종 업데이트: {LAST_UPDATED}
          </p>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--color-ink)]/85">
          <Section title="1. 수집하는 개인정보 항목">
            <p>
              {SITE_NAME}은(는) 현재 회원 가입이나 로그인 없이 운영되며,
              이용자로부터 <b>직접 입력받는 개인정보를 수집하지 않습니다</b>.
            </p>
            <p className="mt-2">
              계산기에 입력하신 뽑기 확률·횟수·비용 등 수치는 브라우저 안에서만
              계산되며 서버로 전송되지 않습니다.
            </p>
          </Section>

          <Section title="2. 자동으로 수집되는 정보">
            <p>
              호스팅 플랫폼(Netlify) 운영상 접속 로그(IP 주소, 접속 시각,
              User-Agent 등)가 보관될 수 있습니다. 이는 플랫폼 운영사(Netlify)의
              기록이며, 운영자가 별도로 열람·활용하지 않습니다. 자세한 사항은{" "}
              <a
                href="https://www.netlify.com/privacy/"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-brand)] underline underline-offset-2"
              >
                Netlify Privacy
              </a>
              를 참고하세요.
            </p>
          </Section>

          <Section title="3. 쿠키 및 분석 도구">
            <p>
              사이트 유입 측정을 위해 <b>Google Analytics 4(GA4)</b>를 사용합니다.
              GA4는 익명 식별용 쿠키(_ga, _ga_*)와 접속 정보를 Google 서버로
              전송하며, IP 주소는 <b>익명화 설정(anonymize_ip)</b>으로
              수집됩니다.
            </p>
            <p className="mt-2">
              GA4는 페이지 조회·유입 경로·접속 환경을 집계하는 데 쓰이며,
              운영자가 개별 이용자를 식별하는 데 사용하지 않습니다. 수집
              항목·보관 기간 등 자세한 사항은{" "}
              <a
                href="https://policies.google.com/privacy"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-brand)] underline underline-offset-2"
              >
                Google 개인정보처리방침
              </a>
              을 참고하세요. GA 추적을 거부하려면{" "}
              <a
                href="https://tools.google.com/dlpage/gaoptout"
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-[var(--color-brand)] underline underline-offset-2"
              >
                Google Analytics 차단 확장 프로그램
              </a>
              을 사용할 수 있습니다.
            </p>
            <p className="mt-2 text-xs text-[var(--color-ink)]/60">
              계산기에 입력한 수치는 여전히 브라우저 안에서만 처리되며 GA로
              전송되지 않습니다.
            </p>
          </Section>

          <Section title="4. 광고 (향후 도입 가능성)">
            <p>
              유입이 쌓이는 시점에 Google AdSense를 도입할 수 있습니다. 도입
              시점에는 다음 사항을 이 페이지에 반영합니다.
            </p>
            <ul className="mt-2 list-inside list-disc space-y-1">
              <li>Google 및 파트너의 쿠키·광고 식별자 사용 사실</li>
              <li>
                이용자가 광고 개인화를 선택할 수 있는{" "}
                <a
                  href="https://adssettings.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[var(--color-brand)] underline underline-offset-2"
                >
                  Google 광고 설정
                </a>{" "}
                안내
              </li>
              <li>EEA·영국 이용자 대상 광고 동의(UMP) 적용</li>
            </ul>
          </Section>

          <Section title="5. 제3자 제공">
            <p>
              이용자로부터 직접 수집한 정보가 없으므로 제3자에게 제공하는
              개인정보도 없습니다.
            </p>
          </Section>

          <Section title="6. 개인정보 보호책임자">
            <p>
              문의: <a href="mailto:akiyun10@gmail.com" className="font-medium text-[var(--color-brand)] underline underline-offset-2">akiyun10@gmail.com</a>
            </p>
          </Section>

          <Section title="7. 변경 사항">
            <p>
              본 방침이 변경되는 경우 이 페이지에 변경 내용과 날짜를 명시합니다.
              변경 사항은 공지 즉시 적용됩니다.
            </p>
          </Section>
        </div>
      </main>
      <Disclaimer />
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-2 text-base font-semibold text-[var(--color-ink)]">
        {title}
      </h2>
      {children}
    </section>
  );
}
