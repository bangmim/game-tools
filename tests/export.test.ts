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
  const layoutSource = readFileSync("app/layout.tsx", "utf8");

  assert.match(robots, /Sitemap: https:\/\/gameting\.netlify\.app\/sitemap\.xml/);
  assert.match(eclipse, /<link rel="canonical" href="https:\/\/gameting\.netlify\.app\/eclipse\/"/);
  assert.doesNotMatch(eclipse, /game-tools\.example\.com/);
  assert.match(layoutSource, /gameting:internal-traffic/);
  assert.match(layoutSource, /ga-disable-/);
});

test("private analytics dashboard is exported but excluded from search", () => {
  const robots = readFileSync("out/robots.txt", "utf8");
  const dashboard = readFileSync("out/admin/analytics/index.html", "utf8");

  assert.match(robots, /Disallow: \/admin\//);
  assert.match(dashboard, /<meta name="robots" content="noindex, nofollow, nocache"/);
  assert.match(dashboard, /GA4 운영 대시보드/);
  assert.doesNotMatch(dashboard, /GA4_SERVICE_ACCOUNT_PRIVATE_KEY/);
});

test("seven discovered pages have unique intent, one H1, canonical and sitemap coverage", () => {
  const sitemap = readFileSync("out/sitemap.xml", "utf8");
  const routes = [
    "dokkaebi",
    "dokkaebi/beginner",
    "dokkaebi/coupon",
    "dokkaebi/gacha",
    "eclipse",
    "eclipse/coupon",
    "eclipse/gacha",
  ];
  const titles = new Set<string>();
  const headings = new Set<string>();

  for (const route of routes) {
    const html = readFileSync(`out/${route}/index.html`, "utf8");
    const normalized = html.replace(/<!--.*?-->/g, "");
    const title = normalized.match(/<title>([^<]+)<\/title>/)?.[1];
    const heading = normalized.match(/<h1[^>]*>([^<]+)<\/h1>/)?.[1];

    assert.ok(title, `${route} needs a title`);
    assert.ok(heading, `${route} needs a visible H1`);
    assert.equal((html.match(/<h1[ >]/g) ?? []).length, 1, `${route} needs exactly one H1`);
    assert.match(html, new RegExp(`<link rel="canonical" href="https://gameting\\.netlify\\.app/${route}/"`));
    assert.match(sitemap, new RegExp(`https://gameting\\.netlify\\.app/${route}/`));
    titles.add(title);
    headings.add(heading);
  }

  assert.equal(titles.size, routes.length);
  assert.equal(headings.size, routes.length);
  assert.match(readFileSync("out/dokkaebi/coupon/index.html", "utf8"), /FAQPage/);
  assert.match(readFileSync("out/eclipse/gacha/index.html", "utf8"), /WebApplication/);
});
