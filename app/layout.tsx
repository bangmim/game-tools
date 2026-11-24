import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { JsonLd } from "@/components/JsonLd";
import { InternalTrafficNotice } from "@/components/InternalTrafficNotice";
import { GA_MEASUREMENT_ID, hasAnalytics } from "@/lib/analytics";
import {
  DEFAULT_KEYWORDS,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TAGLINE,
  SITE_URL,
} from "@/lib/site";

const googleSiteVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION?.trim();
const naverSiteVerification = process.env.NEXT_PUBLIC_NAVER_SITE_VERIFICATION?.trim();

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE_NAME} — ${SITE_TAGLINE}`,
    template: `%s — ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  alternates: { canonical: "/" },
  openGraph: {
    title: `${SITE_NAME} — ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
    type: "website",
    locale: "ko_KR",
    siteName: SITE_NAME,
    url: SITE_URL,
  },
  verification: {
    ...(googleSiteVerification ? { google: googleSiteVerification } : {}),
    ...(naverSiteVerification
      ? { other: { "naver-site-verification": naverSiteVerification } }
      : {}),
  },
  robots: { index: true, follow: true },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko" className="antialiased">
      <body className="min-h-screen flex flex-col">
        {hasAnalytics() && (
          <Script id="ga4-internal-traffic" strategy="beforeInteractive">
            {`
              (function () {
                var key = 'gameting:internal-traffic';
                var url = new URL(window.location.href);
                var setting = url.searchParams.get('internal');
                try {
                  if (setting === '1') localStorage.setItem(key, '1');
                  if (setting === '0') localStorage.removeItem(key);
                } catch (_) {}
                if (setting === '1' || setting === '0') {
                  url.searchParams.delete('internal');
                  history.replaceState(null, '', url.pathname + url.search + url.hash);
                }
                var excluded = window.location.pathname.startsWith('/admin/analytics');
                try { excluded = excluded || localStorage.getItem(key) === '1'; } catch (_) {}
                window.__gametingInternalTraffic = excluded;
                window['ga-disable-${GA_MEASUREMENT_ID}'] = excluded;
              })();
            `}
          </Script>
        )}
        <JsonLd
          data={{
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: SITE_NAME,
            url: SITE_URL,
            description: SITE_DESCRIPTION,
            inLanguage: "ko-KR",
          }}
        />
        {hasAnalytics() && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`}
              strategy="afterInteractive"
            />
            <Script id="ga4-config" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                if (!window.__gametingInternalTraffic) {
                  gtag('config', '${GA_MEASUREMENT_ID}', { anonymize_ip: true });
                }
              `}
            </Script>
          </>
        )}
        {children}
        {hasAnalytics() && <InternalTrafficNotice />}
      </body>
    </html>
  );
}
