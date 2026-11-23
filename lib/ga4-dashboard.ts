export type SummaryMetrics = {
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
  engagementRate: number;
};

export type ComparedSummary = {
  current: SummaryMetrics;
  previous: SummaryMetrics;
  change: Record<keyof SummaryMetrics, number | null>;
};

export type NamedMetric = {
  name: string;
  activeUsers: number;
  sessions: number;
  screenPageViews?: number;
};

export type TrendPoint = {
  date: string;
  activeUsers: number;
  sessions: number;
  screenPageViews: number;
};

export type AnalyticsDashboardData = {
  generatedAt: string;
  realtimeActiveUsers: number;
  sevenDays: ComparedSummary;
  twentyEightDays: ComparedSummary;
  topPages: NamedMetric[];
  sources: NamedMetric[];
  trend: TrendPoint[];
};

export type GaReportRow = {
  dimensionValues?: Array<{ value?: string }>;
  metricValues?: Array<{ value?: string }>;
};

export type GaReportResponse = {
  rows?: GaReportRow[];
  totals?: GaReportRow[];
};

export const EMPTY_SUMMARY: SummaryMetrics = {
  activeUsers: 0,
  sessions: 0,
  screenPageViews: 0,
  engagementRate: 0,
};

export function toNumber(value: string | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function parseSummary(report: GaReportResponse): SummaryMetrics {
  const values = report.totals?.[0]?.metricValues ?? report.rows?.[0]?.metricValues;
  if (!values) return { ...EMPTY_SUMMARY };

  return {
    activeUsers: toNumber(values[0]?.value),
    sessions: toNumber(values[1]?.value),
    screenPageViews: toNumber(values[2]?.value),
    engagementRate: toNumber(values[3]?.value),
  };
}

export function percentChange(current: number, previous: number): number | null {
  if (previous === 0) return current === 0 ? 0 : null;
  return ((current - previous) / previous) * 100;
}

export function compareSummaries(
  current: SummaryMetrics,
  previous: SummaryMetrics,
): ComparedSummary {
  return {
    current,
    previous,
    change: {
      activeUsers: percentChange(current.activeUsers, previous.activeUsers),
      sessions: percentChange(current.sessions, previous.sessions),
      screenPageViews: percentChange(current.screenPageViews, previous.screenPageViews),
      engagementRate: percentChange(current.engagementRate, previous.engagementRate),
    },
  };
}

export function parseNamedMetrics(
  report: GaReportResponse,
  includeViews = false,
): NamedMetric[] {
  return (report.rows ?? []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(알 수 없음)",
    activeUsers: toNumber(row.metricValues?.[0]?.value),
    sessions: toNumber(row.metricValues?.[1]?.value),
    ...(includeViews
      ? { screenPageViews: toNumber(row.metricValues?.[2]?.value) }
      : {}),
  }));
}

export function parseTrend(report: GaReportResponse): TrendPoint[] {
  return (report.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || "",
    activeUsers: toNumber(row.metricValues?.[0]?.value),
    sessions: toNumber(row.metricValues?.[1]?.value),
    screenPageViews: toNumber(row.metricValues?.[2]?.value),
  }));
}

