import { test } from "node:test";
import assert from "node:assert/strict";
import {
  compareSummaries,
  parseNamedMetrics,
  parseSummary,
  parseTrend,
  percentChange,
} from "../lib/ga4-dashboard";
import { hasValidAccessToken } from "../netlify/functions/ga4-dashboard";

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

test("dashboard access requires an exact bearer token", () => {
  const request = (value?: string) => new Request("https://example.com/api", {
    headers: value ? { Authorization: value } : {},
  });

  assert.equal(hasValidAccessToken(request("Bearer correct horse"), "correct horse"), true);
  assert.equal(hasValidAccessToken(request("Bearer correct"), "correct horse"), false);
  assert.equal(hasValidAccessToken(request("Basic correct horse"), "correct horse"), false);
  assert.equal(hasValidAccessToken(request(), "correct horse"), false);
});
