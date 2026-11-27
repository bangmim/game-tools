import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareSummaries,
  parseEvents,
  parseNamedMetrics,
  parseOrganicSearch,
  parseSummary,
  parseTrend,
  percentChange,
} from "../lib/ga4-dashboard";
import { hasValidAccessToken, readRequestedApp } from "../netlify/functions/ga4-dashboard";

test("GA4 summary rows are parsed and compared without division errors", () => {
  const current = parseSummary({
    totals: [{ metricValues: [{ value: "9" }, { value: "12" }, { value: "40" }, { value: "0.625" }] }],
  });
  const previous = parseSummary({
    rows: [{ metricValues: [{ value: "8" }, { value: "10" }, { value: "50" }, { value: "0.5" }] }],
  });
  const compared = compareSummaries(current, previous);

  assert.deepEqual(current, { activeUsers: 9, sessions: 12, screenPageViews: 40, engagementRate: 0.625 });
  assert.equal(compared.change.activeUsers, 12.5);
  assert.equal(compared.change.screenPageViews, -20);
  assert.equal(percentChange(1, 0), null);
  assert.equal(percentChange(0, 0), 0);
});

test("GA4 ranking and trend reports tolerate empty and malformed values", () => {
  const report = {
    rows: [
      {
        dimensionValues: [{ value: "홈" }],
        metricValues: [{ value: "3" }, { value: "4" }, { value: "8" }],
      },
      { dimensionValues: [{}], metricValues: [{ value: "oops" }] },
    ],
  };

  assert.deepEqual(parseNamedMetrics(report, true)[0], {
    name: "홈",
    activeUsers: 3,
    sessions: 4,
    screenPageViews: 8,
  });
  assert.equal(parseNamedMetrics(report)[1].name, "(알 수 없음)");
  assert.deepEqual(parseTrend(report)[0], {
    date: "홈",
    activeUsers: 3,
    sessions: 4,
    screenPageViews: 8,
  });
  assert.deepEqual(parseSummary({}), {
    activeUsers: 0,
    sessions: 0,
    screenPageViews: 0,
    engagementRate: 0,
  });
});

test("organic search totals distinguish zero traffic from a missing ranking", () => {
  const organic = parseOrganicSearch({
    totals: [{ metricValues: [{ value: "3" }, { value: "5" }] }],
    rows: [
      {
        dimensionValues: [{ value: "google / organic" }],
        metricValues: [{ value: "3" }, { value: "5" }],
      },
    ],
  });

  assert.equal(organic.activeUsers, 3);
  assert.equal(organic.sessions, 5);
  assert.equal(organic.sources[0]?.name, "google / organic");
  assert.deepEqual(parseOrganicSearch({}), { activeUsers: 0, sessions: 0, sources: [] });
});

test("dashboard access requires an exact bearer token", () => {
  const request = (value?: string) => new Request("https://example.com/api", {
    headers: value ? { Authorization: value } : {},
  });

  assert.equal(hasValidAccessToken(request("Bearer correct horse"), "correct horse"), true);
  assert.equal(hasValidAccessToken(request("Bearer correct"), "correct horse"), false);
  assert.equal(hasValidAccessToken(request("Basic correct horse"), "correct horse"), false);
  assert.equal(hasValidAccessToken(request(), "correct horse"), false);
});

test("event reports expose only the event name and count needed by the dashboard", () => {
  assert.deepEqual(parseEvents({
    rows: [{
      dimensionValues: [{ value: "puzzle_complete" }],
      metricValues: [{ value: "7" }],
    }],
  }), [{ name: "puzzle_complete", eventCount: 7 }]);
  assert.deepEqual(parseEvents({}), []);
});

test("dashboard app selection accepts only server-supported app keys", async () => {
  const request = (body?: unknown) => new Request("https://example.com/api", {
    method: "POST",
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });

  assert.equal(await readRequestedApp(request({ app: "linkting" })), "linkting");
  assert.equal(await readRequestedApp(request({ app: "game-tools" })), "game-tools");
  assert.equal(await readRequestedApp(request({ app: "unknown" })), null);
  assert.equal(await readRequestedApp(request()), "game-tools");
});
