import type { Metadata } from "next";
import { AnalyticsDashboard } from "./AnalyticsDashboard";

export const metadata: Metadata = {
  title: "GA4 운영 대시보드",
  description: "운영자 전용 GA4 방문·조회 현황",
  robots: { index: false, follow: false, nocache: true },
};

export default function AnalyticsPage() {
  return <AnalyticsDashboard />;
}

