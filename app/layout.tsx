import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "게임 도구",
    template: "%s — 게임 도구",
  },
  description:
    "신작 모바일 게임의 뽑기 확률 계산기, 쿠폰 모음을 제공하는 팬 메이드 도구.",
  openGraph: {
    title: "게임 도구",
    description: "신작 모바일 게임 확률 계산기 · 쿠폰 모음",
    type: "website",
    locale: "ko_KR",
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="antialiased">
      <body className="min-h-screen flex flex-col">{children}</body>
    </html>
  );
}
