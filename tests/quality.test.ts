import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { CouponList } from "../components/CouponList";
import { test } from "node:test";
import assert from "node:assert/strict";
import { gacha } from "../lib/gacha";
import { splitCoupons, formatExpiry } from "../lib/coupons";
import { dokkaebi } from "../data/games/dokkaebi";

test("independent draws match known probabilities and minimal target counts", () => {
  const r = gacha({ ratePercent: 1, tries: 100 });
  assert.ok(Math.abs(r.atLeastOne - 0.6339676587) < 1e-9);
  const need = r.needForTarget(0.9);
  assert.ok(gacha({ ratePercent: 1, tries: need }).atLeastOne >= 0.9);
  assert.ok(gacha({ ratePercent: 1, tries: need - 1 }).atLeastOne < 0.9);
  assert.equal(r.needForTarget(0), 0);
  assert.equal(r.needForTarget(1), Infinity);
});

test("zero probability with pity still guarantees first acquisition", () => {
  assert.equal(gacha({ ratePercent: 0, tries: 89, pity: 90 }).atLeastOne, 0);
  const r = gacha({ ratePercent: 0, tries: 90, pity: 90, costPerTry: 160 });
  assert.equal(r.atLeastOne, 1);
  assert.equal(r.needForTarget(0.99), 90);
  assert.equal(r.needForTarget(1), 90);
  assert.equal(r.costForTarget?.(0.99), 14400);
});

test("certain probability and zero trials do not produce NaN", () => {
  const r = gacha({ ratePercent: 100, tries: 0 });
  assert.equal(r.atLeastOne, 0);
  assert.equal(r.none, 1);
  assert.equal(r.needForTarget(1), 1);
  assert.equal(gacha({ ratePercent: 0, tries: 1 }).needForTarget(0.5), Infinity);
  assert.equal(gacha({ ratePercent: NaN, tries: Infinity }).atLeastOne, 0);
});

test("coupon stays active through the full final valid minute", () => {
  const coupon = dokkaebi.coupons.find((c) => c.code === "도깨비1008")!;
  const deadline = Date.parse(coupon.expiresAt!);
  assert.equal(splitCoupons([coupon], deadline - 1).active.length, 1);
  assert.equal(splitCoupons([coupon], deadline).expired.length, 1);
  assert.match(formatExpiry(coupon.expiresAt!), /11\. 05\..*23:59.*한국 시간/);
  assert.equal(splitCoupons(dokkaebi.coupons, Date.parse("2026-11-12T00:00:00+09:00")).active.length, 3);
});

test("unknown and officially unlimited coupons remain distinct", () => {
  assert.equal(dokkaebi.coupons.filter((c) => c.unlimited).length, 3);
  assert.ok(dokkaebi.coupons.every((c) => c.verifiedAt === "2026-10-15"));
});

test("dated coupons cannot be copied before browser deadline check", () => {
  const html = renderToStaticMarkup(createElement(CouponList, {
    coupons: [dokkaebi.coupons.find((c) => c.code === "도깨비1008")!], couponUrl: null,
  }));
  assert.match(html, /기한 확인 중/);
  assert.doesNotMatch(html, /<button/);
  assert.match(html, /한국 시간/);
});
