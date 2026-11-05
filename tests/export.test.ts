import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("prepared games stay indexed; placeholder game pages are noindex and absent from sitemap", () => {
  const sitemap = readFileSync("out/sitemap.xml", "utf8");
  assert.match(sitemap, /https:\/\/gameting\.netlify\.app\/eclipse\/coupon\//);
  assert.doesNotMatch(sitemap, /game-tools\.example\.com/);
  assert.doesNotMatch(sitemap, /\/tempal\//);
  for (const route of ["", "coupon/", "gacha/"]) {
    const html = readFileSync(`out/tempal/${route}index.html`, "utf8");
    assert.match(html, /<meta name="robots" content="noindex, follow"/);
  }
  for (const slug of ["dokkaebi", "eclipse"]) {
    assert.match(sitemap, new RegExp(`/${slug}/coupon/`));
    assert.doesNotMatch(readFileSync(`out/${slug}/coupon/index.html`, "utf8"), /content="noindex/);
  }
});

test("production metadata points search engines to the live site", () => {
  const robots = readFileSync("out/robots.txt", "utf8");
  const eclipse = readFileSync("out/eclipse/index.html", "utf8");

  assert.match(robots, /Sitemap: https:\/\/gameting\.netlify\.app\/sitemap\.xml/);
  assert.match(eclipse, /<link rel="canonical" href="https:\/\/gameting\.netlify\.app\/eclipse\/"/);
  assert.doesNotMatch(eclipse, /game-tools\.example\.com/);
});
