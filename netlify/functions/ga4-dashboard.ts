import { createSign, timingSafeEqual } from "node:crypto";
import {
  compareSummaries,
  parseNamedMetrics,
  parseSummary,
  parseTrend,
  toNumber,
  type AnalyticsDashboardData,
  type GaReportResponse,
} from "../../lib/ga4-dashboard";

const ANALYTICS_SCOPE = "https://www.googleapis.com/auth/analytics.readonly";
const TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token";
const DATA_API = "https://analyticsdata.googleapis.com/v1beta";

type Environment = {
  GA4_PROPERTY_ID: string;
  GA4_SERVICE_ACCOUNT_EMAIL: string;
  GA4_SERVICE_ACCOUNT_PRIVATE_KEY: string;
  GA4_DASHBOARD_ACCESS_TOKEN: string;
};

type ReportRequest = {
  dimensions?: Array<{ name: string }>;
  metrics: Array<{ name: string }>;
  dateRanges: Array<{ startDate: string; endDate: string }>;
  metricAggregations?: string[];
  orderBys?: Array<Record<string, unknown>>;
  limit?: string;
};

function json(body: unknown, status = 200): Response {
  return Response.json(body, {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

function readEnvironment(): Environment {
  const keys = [
    "GA4_PROPERTY_ID",
    "GA4_SERVICE_ACCOUNT_EMAIL",
    "GA4_SERVICE_ACCOUNT_PRIVATE_KEY",
    "GA4_DASHBOARD_ACCESS_TOKEN",
  ] as const;

  const missing = keys.filter((key) => !process.env[key]?.trim());
  if (missing.length > 0) {
    throw new Error(`Missing environment variables: ${missing.join(", ")}`);
  }

  return Object.fromEntries(
    keys.map((key) => [key, process.env[key]!.trim()]),
  ) as unknown as Environment;
}

export function hasValidAccessToken(request: Request, expected: string): boolean {
  const authorization = request.headers.get("authorization") ?? "";
  const supplied = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  const suppliedBuffer = Buffer.from(supplied);
  const expectedBuffer = Buffer.from(expected);
  return (
    suppliedBuffer.length === expectedBuffer.length &&
    timingSafeEqual(suppliedBuffer, expectedBuffer)
  );
}

function base64Url(value: string | Buffer): string {
  return Buffer.from(value).toString("base64url");
}

async function getGoogleAccessToken(environment: Environment): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64Url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claims = base64Url(
    JSON.stringify({
      iss: environment.GA4_SERVICE_ACCOUNT_EMAIL,
      scope: ANALYTICS_SCOPE,
      aud: TOKEN_ENDPOINT,
      iat: now,
      exp: now + 3600,
    }),
  );
  const unsigned = `${header}.${claims}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  signer.end();
  const privateKey = environment.GA4_SERVICE_ACCOUNT_PRIVATE_KEY.replace(
    /\\n/g,
    "\n",
  );
  const assertion = `${unsigned}.${base64Url(signer.sign(privateKey))}`;

  const response = await fetch(TOKEN_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  if (!response.ok) throw new Error(`Google OAuth failed (${response.status})`);

  const payload = (await response.json()) as { access_token?: string };
  if (!payload.access_token) throw new Error("Google OAuth returned no access token");
  return payload.access_token;
}

async function runReport(
  environment: Environment,
  accessToken: string,
  request: ReportRequest,
): Promise<GaReportResponse> {
  const response = await fetch(
    `${DATA_API}/properties/${encodeURIComponent(environment.GA4_PROPERTY_ID)}:runReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(request),
    },
  );
  if (!response.ok) throw new Error(`GA4 report failed (${response.status})`);
  return (await response.json()) as GaReportResponse;
}

async function runRealtimeReport(
  environment: Environment,
  accessToken: string,
): Promise<GaReportResponse> {
  const response = await fetch(
    `${DATA_API}/properties/${encodeURIComponent(environment.GA4_PROPERTY_ID)}:runRealtimeReport`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ metrics: [{ name: "activeUsers" }] }),
    },
  );
  if (!response.ok) throw new Error(`GA4 realtime report failed (${response.status})`);
  return (await response.json()) as GaReportResponse;
}

const summaryRequest = (startDate: string, endDate: string): ReportRequest => ({
  metrics: [
    { name: "activeUsers" },
    { name: "sessions" },
    { name: "screenPageViews" },
    { name: "engagementRate" },
  ],
  dateRanges: [{ startDate, endDate }],
  metricAggregations: ["TOTAL"],
});

async function loadDashboard(environment: Environment): Promise<AnalyticsDashboardData> {
  const accessToken = await getGoogleAccessToken(environment);
  const [seven, previousSeven, twentyEight, previousTwentyEight, pages, sources, trend, realtime] =
    await Promise.all([
      runReport(environment, accessToken, summaryRequest("6daysAgo", "today")),
      runReport(environment, accessToken, summaryRequest("13daysAgo", "7daysAgo")),
      runReport(environment, accessToken, summaryRequest("27daysAgo", "today")),
      runReport(environment, accessToken, summaryRequest("55daysAgo", "28daysAgo")),
      runReport(environment, accessToken, {
        dimensions: [{ name: "pageTitle" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
        orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
        limit: "10",
      }),
      runReport(environment, accessToken, {
        dimensions: [{ name: "sessionSourceMedium" }],
        metrics: [{ name: "activeUsers" }, { name: "sessions" }],
        dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
        orderBys: [{ metric: { metricName: "sessions" }, desc: true }],
        limit: "10",
      }),
      runReport(environment, accessToken, {
        dimensions: [{ name: "date" }],
        metrics: [
          { name: "activeUsers" },
          { name: "sessions" },
          { name: "screenPageViews" },
        ],
        dateRanges: [{ startDate: "27daysAgo", endDate: "today" }],
        orderBys: [{ dimension: { dimensionName: "date" } }],
        limit: "31",
      }),
      runRealtimeReport(environment, accessToken),
    ]);

  return {
    generatedAt: new Date().toISOString(),
    realtimeActiveUsers: toNumber(realtime.rows?.[0]?.metricValues?.[0]?.value),
    sevenDays: compareSummaries(parseSummary(seven), parseSummary(previousSeven)),
    twentyEightDays: compareSummaries(
      parseSummary(twentyEight),
      parseSummary(previousTwentyEight),
    ),
    topPages: parseNamedMetrics(pages, true),
    sources: parseNamedMetrics(sources),
    trend: parseTrend(trend),
  };
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  let environment: Environment;
  try {
    environment = readEnvironment();
  } catch (error) {
    console.error("GA4 dashboard configuration error", error);
    return json({ error: "대시보드 서버 설정이 완료되지 않았습니다." }, 503);
  }

  if (!hasValidAccessToken(request, environment.GA4_DASHBOARD_ACCESS_TOKEN)) {
    return json({ error: "접근 암호가 올바르지 않습니다." }, 401);
  }

  try {
    return json(await loadDashboard(environment));
  } catch (error) {
    console.error("GA4 dashboard request failed", error);
    return json(
      { error: "GA4 데이터를 불러오지 못했습니다. 권한과 환경변수를 확인해 주세요." },
      502,
    );
  }
}

