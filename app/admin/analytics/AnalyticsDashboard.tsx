"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import type {
  AnalyticsDashboardData,
  ComparedSummary,
  NamedMetric,
} from "@/lib/ga4-dashboard";

const STORAGE_KEY = "gameting:analytics-access-token";

const number = new Intl.NumberFormat("ko-KR");
const percent = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 1,
  signDisplay: "exceptZero",
});

type Period = "sevenDays" | "twentyEightDays";

function Change({ value }: { value: number | null }) {
  if (value === null) return <span className="text-slate-500">신규</span>;
  const color = value > 0 ? "text-emerald-700" : value < 0 ? "text-rose-700" : "text-slate-500";
  return <span className={color}>이전 기간 대비 {percent.format(value)}%</span>;
}

function MetricCard({
  label,
  value,
  change,
  note,
  suffix,
}: {
  label: string;
  value: number;
  change?: number | null;
  note?: string;
  suffix?: string;
}) {
  return (
    <article className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <p className="text-sm font-semibold text-slate-500">{label}</p>
      <p className="mt-2 text-3xl font-black tracking-tight text-slate-950">{number.format(value)}{suffix}</p>
      <p className="mt-2 text-xs font-medium">
        {change === undefined ? <span className="text-slate-500">{note}</span> : <Change value={change} />}
      </p>
    </article>
  );
}

function SummaryCards({ summary }: { summary: ComparedSummary }) {
  return (
    <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" aria-label="핵심 지표">
      <MetricCard label="활성 사용자" value={summary.current.activeUsers} change={summary.change.activeUsers} />
      <MetricCard label="방문 세션" value={summary.current.sessions} change={summary.change.sessions} />
      <MetricCard label="페이지 조회" value={summary.current.screenPageViews} change={summary.change.screenPageViews} />
      <MetricCard
        label="참여율"
        value={Math.round(summary.current.engagementRate * 100)}
        change={summary.change.engagementRate}
        suffix="%"
      />
    </section>
  );
}

function Ranking({
  title,
  rows,
  mode,
}: {
  title: string;
  rows: NamedMetric[];
  mode: "views" | "sessions";
}) {
  const maximum = Math.max(1, ...rows.map((row) => (mode === "views" ? row.screenPageViews ?? 0 : row.sessions)));

  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur">
      <h2 className="text-lg font-black text-slate-950">{title}</h2>
      <p className="mt-1 text-xs text-slate-500">최근 28일 · 최대 10개</p>
      <div className="mt-5 space-y-4">
        {rows.length === 0 && <p className="py-8 text-center text-sm text-slate-500">표시할 데이터가 없습니다.</p>}
        {rows.map((row) => {
          const value = mode === "views" ? row.screenPageViews ?? 0 : row.sessions;
          return (
            <div key={row.name}>
              <div className="flex items-start justify-between gap-4 text-sm">
                <span className="min-w-0 truncate font-semibold text-slate-700" title={row.name}>{row.name}</span>
                <span className="shrink-0 font-black text-slate-950">{number.format(value)}</span>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-indigo-100">
                <div
                  className="h-full rounded-full bg-indigo-600"
                  style={{ width: `${Math.max(2, (value / maximum) * 100)}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

function Trend({ data }: { data: AnalyticsDashboardData["trend"] }) {
  const maximum = Math.max(1, ...data.map((point) => point.screenPageViews));
  return (
    <section className="rounded-3xl border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur xl:col-span-2">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-lg font-black text-slate-950">28일 조회 추이</h2>
          <p className="mt-1 text-xs text-slate-500">날짜별 페이지 조회수</p>
        </div>
        <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-700">최고 {number.format(maximum)}회</span>
      </div>
      <div className="mt-6 flex h-48 items-end gap-1" aria-label="날짜별 페이지 조회 막대그래프">
        {data.map((point) => (
          <div key={point.date} className="group relative flex h-full min-w-0 flex-1 items-end">
            <div
              className="w-full rounded-t-sm bg-indigo-500 transition-colors group-hover:bg-indigo-700"
              style={{ height: `${Math.max(2, (point.screenPageViews / maximum) * 100)}%` }}
              title={`${point.date}: 조회 ${point.screenPageViews}회`}
            />
          </div>
        ))}
      </div>
      <div className="mt-2 flex justify-between text-[11px] font-medium text-slate-400">
        <span>{data[0]?.date || "-"}</span>
        <span>{data.at(-1)?.date || "-"}</span>
      </div>
    </section>
  );
}

export function AnalyticsDashboard() {
  const [accessToken, setAccessToken] = useState("");
  const [data, setData] = useState<AnalyticsDashboardData | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState<Period>("twentyEightDays");

  const load = async (token: string) => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ga4-dashboard", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const contentType = response.headers.get("content-type") ?? "";
      if (!contentType.includes("application/json")) {
        throw new Error(
          window.location.hostname === "localhost"
            ? "로컬 정적 미리보기에서는 GA4 API가 실행되지 않습니다. Netlify Function 연결 후 확인해 주세요."
            : "대시보드 API가 아직 배포되지 않았습니다.",
        );
      }
      const payload = (await response.json()) as AnalyticsDashboardData & { error?: string };
      if (!response.ok) throw new Error(payload.error || "데이터를 불러오지 못했습니다.");
      sessionStorage.setItem(STORAGE_KEY, token);
      setData(payload);
    } catch (reason) {
      setData(null);
      setError(reason instanceof Error ? reason.message : "데이터를 불러오지 못했습니다.");
      if (reason instanceof Error && reason.message.includes("암호")) sessionStorage.removeItem(STORAGE_KEY);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      queueMicrotask(() => {
        setAccessToken(saved);
        void load(saved);
      });
    }
  }, []);

  const generatedAt = useMemo(
    () => data ? new Intl.DateTimeFormat("ko-KR", { dateStyle: "medium", timeStyle: "short", timeZone: "Asia/Seoul" }).format(new Date(data.generatedAt)) : "",
    [data],
  );

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (accessToken.trim()) void load(accessToken.trim());
  };

  const logout = () => {
    sessionStorage.removeItem(STORAGE_KEY);
    setAccessToken("");
    setData(null);
    setError("");
  };

  if (!data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top_left,_#c7d2fe,_transparent_40%),radial-gradient(circle_at_bottom_right,_#fde68a,_transparent_34%)] px-5 py-10">
        <section className="w-full max-w-md rounded-[2rem] border border-white/70 bg-white/90 p-7 shadow-xl backdrop-blur">
          <span className="inline-flex rounded-full bg-indigo-100 px-3 py-1 text-xs font-black tracking-wide text-indigo-700">OWNER ONLY</span>
          <h1 className="mt-5 text-3xl font-black tracking-tight text-slate-950">GA4 운영 대시보드</h1>
          <p className="mt-3 text-sm leading-6 text-slate-600">방문자, 조회수와 유입 경로를 한 화면에서 확인합니다. Netlify에 등록한 접근 암호를 입력해 주세요.</p>
          <form onSubmit={submit} className="mt-7 space-y-4">
            <label className="block text-sm font-bold text-slate-700" htmlFor="dashboard-token">접근 암호</label>
            <input
              id="dashboard-token"
              type="password"
              autoComplete="current-password"
              value={accessToken}
              onChange={(event) => setAccessToken(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-950 outline-none ring-indigo-500 transition focus:ring-2"
              placeholder="접근 암호 입력"
              required
            />
            {error && <p role="alert" className="rounded-2xl bg-rose-50 p-3 text-sm font-semibold text-rose-700">{error}</p>}
            <button disabled={loading} className="w-full rounded-2xl bg-indigo-600 px-5 py-3 font-black text-white transition hover:bg-indigo-700 disabled:cursor-wait disabled:opacity-60">
              {loading ? "GA4 불러오는 중…" : "대시보드 열기"}
            </button>
          </form>
          <p className="mt-5 text-xs leading-5 text-slate-400">암호는 이 브라우저 탭의 세션 저장소에만 보관되며 GA4 서비스 계정 키는 서버 밖으로 전송되지 않습니다.</p>
        </section>
      </main>
    );
  }

  const selectedSummary = data[period];
  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top_left,_#c7d2fe,_transparent_35%),radial-gradient(circle_at_top_right,_#fde68a,_transparent_28%)] px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <header className="flex flex-col gap-5 rounded-[2rem] border border-white/70 bg-slate-950 p-6 text-white shadow-xl sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black tracking-[0.16em] text-indigo-300">
              <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-emerald-400" /> LIVE ANALYTICS
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">gameting 현황</h1>
            <p className="mt-2 text-sm text-slate-400">마지막 갱신 {generatedAt}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => void load(accessToken)} disabled={loading} className="rounded-xl bg-white px-4 py-2 text-sm font-black text-slate-950 disabled:opacity-50">{loading ? "갱신 중…" : "새로고침"}</button>
            <button onClick={logout} className="rounded-xl border border-slate-700 px-4 py-2 text-sm font-bold text-slate-300">잠그기</button>
          </div>
        </header>

        <section className="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-center">
          <div className="inline-flex w-fit rounded-2xl bg-white/80 p-1 shadow-sm">
            {(["sevenDays", "twentyEightDays"] as const).map((value) => (
              <button key={value} onClick={() => setPeriod(value)} className={`rounded-xl px-4 py-2 text-sm font-black transition ${period === value ? "bg-indigo-600 text-white" : "text-slate-500 hover:text-slate-950"}`}>
                {value === "sevenDays" ? "최근 7일" : "최근 28일"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-3 rounded-2xl bg-emerald-50 px-4 py-3 text-emerald-800 shadow-sm">
            <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-emerald-500" />
            <span className="text-sm font-bold">최근 30분 활성 사용자</span>
            <strong className="text-xl font-black">{number.format(data.realtimeActiveUsers)}</strong>
          </div>
        </section>

        <div className="mt-4"><SummaryCards summary={selectedSummary} /></div>

        <section className="mt-4 grid gap-4 xl:grid-cols-2">
          <Trend data={data.trend} />
          <Ranking title="인기 페이지" rows={data.topPages} mode="views" />
          <Ranking title="유입 경로" rows={data.sources} mode="sessions" />
        </section>

        <footer className="py-8 text-center text-xs text-slate-500">GA4 집계에는 최대 24~48시간의 처리 지연이 있을 수 있습니다. 실시간 수치는 최근 30분 기준입니다.</footer>
      </div>
    </main>
  );
}

