import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("prepared game stays indexed; placeholder game pages are noindex and absent from sitemap", () => {
  const sitemap = readFileSync("out/sitemap.xml", "utf8");
  for (const slug of ["tempal", "eclipse"]) {
    assert.doesNotMatch(sitemap, new RegExp(`/${slug}/`));
    for (const route of ["", "coupon/", "gacha/"]) {
      const html = readFileSync(`out/${slug}/${route}index.html`, "utf8");
      assert.match(html, /<meta name="robots" content="noindex, follow"/);
    }
  }
  assert.match(sitemap, /\/dokkaebi\/coupon\//);
  assert.doesNotMatch(readFileSync("out/dokkaebi/coupon/index.html", "utf8"), /content="noindex/);
});
