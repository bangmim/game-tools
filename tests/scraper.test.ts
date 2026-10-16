import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import type { Page } from "playwright";
import { assertNoticeUrl, collectNoticeUrls, extractCouponsFromBody, NOTICE_BODY, scrapeDetail, scrapeOne } from "../scripts/scrape-coupons";
import { dokkaebi } from "../data/games/dokkaebi";

const listUrl = dokkaebi.scrape!.noticeListUrl;
const detailUrl = "https://forum.kakaogames.com/dokkaebi/postView/?code=notice&id=13991";
const fixture = readFileSync("tests/fixtures/official-notice.html", "utf8");
// Mock only browser transport/readiness. Content comes from an observed official
// DOM shape, with a hostile comment outside the article boundary.
function fakePage({ status = 200, missingBody = false, emptyBody = false, noResponse = false, redirect = "", noCode = false, links = [{ text: "쿠폰 안내", href: detailUrl }], detailFailure = false } = {}) {
  let current = listUrl;
  const calls: string[] = [];
  const page = {
    url: () => current,
    goto: async (url: string) => { current = redirect || url; return noResponse ? null : { ok: () => status === 200, status: () => status }; },
    locator: (selector: string) => {
      calls.push(selector);
      return {
        first() { return this; },
        waitFor: async () => { if (missingBody || (detailFailure && selector === NOTICE_BODY)) throw new Error("locator timeout"); },
        evaluateAll: async () => links,
        innerText: async () => {
          if (selector === NOTICE_BODY) return emptyBody ? "" : noCode ? "쿠폰 사용 방법을 안내합니다." : fixture.match(/class="board-view__body"><p>([\s\S]*?)<\/p>/)![1];
          if (selector === ".board-view__head .date") return "2026.10.11 11:27:51";
          throw new Error(`Unexpected broad read: ${selector}`);
        },
      };
    },
  };
  return { page: page as unknown as Page, calls };
}

test("detail extracts official body and excludes coupon-shaped user comment", async () => {
  assert.equal(extractCouponsFromBody(fixture.replace(/<[^>]*>/g, "\n")).length, 2);
  const { page, calls } = fakePage();
  const coupons = await scrapeDetail(page, detailUrl, listUrl);
  assert.deepEqual(coupons.map((c) => c.code), ["OFFICIAL123"]);
  assert.ok(calls.includes(".board-view__body"));
  assert.ok(!calls.includes("body"));
});

test("HTTP failures, SPA shell and empty article fail instead of zero-success", async () => {
  for (const status of [403, 503]) await assert.rejects(collectNoticeUrls(fakePage({ status }).page, dokkaebi.scrape!), /HTTP failure/);
  await assert.rejects(collectNoticeUrls(fakePage({ noResponse: true }).page, dokkaebi.scrape!), /HTTP failure/);
  await assert.rejects(collectNoticeUrls(fakePage({ redirect: "https://evil.example" }).page, dokkaebi.scrape!), /Not an official/);
  await assert.rejects(collectNoticeUrls(fakePage({ links: [] }).page, dokkaebi.scrape!), /did not load/);
  await assert.rejects(collectNoticeUrls(fakePage({ missingBody: true }).page, dokkaebi.scrape!), /timeout/);
  await assert.rejects(scrapeDetail(fakePage({ emptyBody: true }).page, detailUrl, listUrl), /did not load/);
});

test("notice link allowlist rejects cross-origin, wrong boards and missing ids", async () => {
  for (const url of ["https://evil.example/dokkaebi/postView/?code=notice&id=1", detailUrl.replace("code=notice", "code=talk"), detailUrl.replace("id=13991", "id="), detailUrl.replace("/dokkaebi/", "/other/")]) {
    assert.throws(() => assertNoticeUrl(url, listUrl), /Not an official/);
  }
  await assert.rejects(collectNoticeUrls(fakePage({ links: [{ text: "쿠폰 안내", href: "https://evil.example" }] }).page, dokkaebi.scrape!), /Not an official/);
});

test("any detail failure aborts collection; a loaded article without code is allowed", async () => {
  await assert.rejects(scrapeOne(fakePage({ detailFailure: true }).page, dokkaebi), /timeout/);
  const { page } = fakePage();
  assert.equal((await collectNoticeUrls(page, dokkaebi.scrape!)).length, 1);
  assert.deepEqual(await scrapeDetail(fakePage({ noCode: true }).page, detailUrl, listUrl), []);
  assert.deepEqual(await collectNoticeUrls(fakePage({ links: [{ text: "점검 안내", href: detailUrl }] }).page, dokkaebi.scrape!), []);
});
