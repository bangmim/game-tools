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

export type EventMetric = {
  name: string;
  eventCount: number;
};

export type AnalyticsAppKey = "game-tools" | "linkting";

export type AnalyticsDashboardData = {
  app: AnalyticsAppKey;
  generatedAt: string;
  realtimeActiveUsers: number;
  sevenDays: ComparedSummary;
  twentyEightDays: ComparedSummary;
  topPages: NamedMetric[];
  sources: NamedMetric[];
  organicSearch: {
    activeUsers: number;
    sessions: number;
    sources: NamedMetric[];
  };
  trend: TrendPoint[];
  topEvents: EventMetric[];
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

export function parseOrganicSearch(report: GaReportResponse): AnalyticsDashboardData["organicSearch"] {
  const sources = parseNamedMetrics(report);
  const totals = report.totals?.[0]?.metricValues;
  return {
    activeUsers: totals
      ? toNumber(totals[0]?.value)
      : sources.reduce((sum, row) => sum + row.activeUsers, 0),
    sessions: totals
      ? toNumber(totals[1]?.value)
      : sources.reduce((sum, row) => sum + row.sessions, 0),
    sources,
  };
}

export function parseTrend(report: GaReportResponse): TrendPoint[] {
  return (report.rows ?? []).map((row) => ({
    date: row.dimensionValues?.[0]?.value || "",
    activeUsers: toNumber(row.metricValues?.[0]?.value),
    sessions: toNumber(row.metricValues?.[1]?.value),
    screenPageViews: toNumber(row.metricValues?.[2]?.value),
  }));
}

export function parseEvents(report: GaReportResponse): EventMetric[] {
  return (report.rows ?? []).map((row) => ({
    name: row.dimensionValues?.[0]?.value || "(알 수 없음)",
    eventCount: toNumber(row.metricValues?.[0]?.value),
  }));
}

