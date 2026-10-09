/**
 * 공식 공지 쿠폰 자동 수집 스크립트.
 *
 * - 지원 게임: `data/games/*.ts`에서 `scrape.scrapeEnabled: true`인 Game만.
 * - 데이터 소스: 공식 공지 리스트 (SPA) → Playwright headless chromium.
 * - 추출: 정규식 + CSS selector만. LLM 사용 금지 (HANDOFF §7.3 hallucination 방지).
 * - 콘텐츠 수집 규칙 (CLAUDE.md):
 *   · 공식 공지에서만 수집한다.
 *   · 각 쿠폰에 sourceUrl + collectedAt 명시.
 *   · reward는 공지 원문 복사 금지 — 자체 요약 placeholder만 넣고
 *     사용자가 손으로 다듬도록 TODO 플래그 (`__TODO__ reward`) 포함.
 *
 * 사용:
 *   pnpm run scrape:coupons        # 기본: 실제 파일 수정
 *   pnpm run scrape:coupons --dry  # dry-run (파일 수정 없이 로그만)
 *
 * exit code: 성공 0 (신규 유무 상관없음), 에러 1.
 */
import { chromium, type Page } from "playwright";
import { readFileSync, writeFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

import { GAMES } from "../data/games";
import type { Game, Coupon, ScrapeConfig } from "../data/games/types";

const __dirname = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = resolve(__dirname, "..");

const DRY_RUN = process.argv.includes("--dry");

// ─────────────────────────────────────────────────────────────────────────────
// 쿠폰 코드 추출 패턴 (보수적 — false positive 최소화 우선)
// ─────────────────────────────────────────────────────────────────────────────
// 코드 토큰: 한글/영문/숫자, 길이 3~20, 공백·기호 금지
const CODE_TOKEN = /^[가-힣A-Za-z0-9]{3,20}$/;
// 패턴 A: "쿠폰 코드 : CODE" / "특별 쿠폰 코드 : CODE" (line-level)
const PATTERN_A = /(?:특별\s*)?쿠폰\s*코드\s*[:：]\s*([^\s\n|,]+)/g;
// 패턴 B: "ㅇ 쿠폰 N" 다음 라인이 코드 (라인 블록 scan)
const PATTERN_B_HEADER = /^(?:ㅇ|○|●|•)\s*쿠폰\s*\d+/;
// 패턴 C: 테이블형 "쿠폰 코드 | <reward> | <CODE>" — "쿠폰 코드" 뒤 pipe 세그먼트
// 패턴 C는 단일 라인 안에서 "쿠폰 코드" 뒤 토큰을 뽑는다. 복수 매칭 가능.
const PATTERN_C = /쿠폰\s*코드\s*\|\s*[^|]+?\|\s*([가-힣A-Za-z0-9]{3,20})/g;

type ExtractedCoupon = {
  code: string;
  rewardHint: string;
  sourceUrl: string;
  publishedAt: string | null;
};

function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

function uniqByCode<T extends { code: string }>(arr: T[]): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const x of arr) {
    if (seen.has(x.code)) continue;
    seen.add(x.code);
    out.push(x);
  }
  return out;
}

/**
 * 공지 본문 텍스트에서 쿠폰 코드 후보를 뽑는다.
 * 반환되는 code는 CODE_TOKEN을 통과한 것만.
 */
function extractCouponsFromBody(body: string): { code: string; rewardHint: string }[] {
  const results: { code: string; rewardHint: string }[] = [];
  // 패턴 A/C는 raw body에 적용 (문자열 전역 regex)
  // 패턴 B는 blank line 제거 후 라인 블록 scan

  // 패턴 A
  for (const m of body.matchAll(PATTERN_A)) {
    const code = m[1].trim();
    if (CODE_TOKEN.test(code)) {
      // 보상 힌트: match 라인 다음 3줄 중 '엽전/상자/주머니/칭호/조각' 포함
      const idx = body.indexOf(m[0]);
      const context = body.slice(idx, idx + 400).split("\n").slice(1, 6).map((s) => s.trim()).filter(Boolean);
      const hint = context.filter((l) => /엽전|상자|주머니|칭호|조각|가호|요혼석|의복|무기/.test(l)).slice(0, 3).join(", ");
      results.push({ code, rewardHint: hint });
    }
  }

  // 패턴 B — blank line 제거 후 scan
  const nonEmpty = body.split("\n").map((s) => s.trim()).filter(Boolean);
  for (let i = 0; i < nonEmpty.length - 1; i++) {
    if (PATTERN_B_HEADER.test(nonEmpty[i])) {
      const next = nonEmpty[i + 1];
      if (next && CODE_TOKEN.test(next)) {
        const hint = nonEmpty
          .slice(i + 2, i + 5)
          .filter((l) => /엽전|상자|주머니|칭호|조각|가호|요혼석|의복|무기/.test(l))
          .join(", ");
        results.push({ code: next, rewardHint: hint });
      }
    }
  }

  // 패턴 C
  for (const m of body.matchAll(PATTERN_C)) {
    const code = m[1].trim();
    if (CODE_TOKEN.test(code)) {
      results.push({ code, rewardHint: "" });
    }
  }

  return uniqByCode(results);
}

/** 공지 본문에서 발행일 (YYYY-MM-DD) 추출. */
function extractPublishedAt(body: string): string | null {
  const m = body.match(/(\d{4})\.(\d{2})\.(\d{2})\s+\d{2}:/);
  return m ? `${m[1]}-${m[2]}-${m[3]}` : null;
}

/** 공지 리스트에서 쿠폰 공지 URL 목록을 가져온다. */
async function collectNoticeUrls(page: Page, cfg: ScrapeConfig): Promise<{ title: string; url: string }[]> {
  await page.goto(cfg.noticeListUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
  await sleep(3500); // SPA 렌더 대기

  const links = await page.$$eval("a", (as: HTMLAnchorElement[]) =>
    as.map((a) => ({ text: a.textContent?.trim() || "", href: a.href })),
  );
  const kws = cfg.titleKeywords;
  const filtered = links.filter(
    (l) =>
      l.text &&
      /postView/.test(l.href) &&
      /code=notice/.test(l.href) &&
      kws.some((kw) => l.text.includes(kw)),
  );
  // dedupe by url
  const seen = new Set<string>();
  const out: { title: string; url: string }[] = [];
  for (const l of filtered) {
    if (seen.has(l.href)) continue;
    seen.add(l.href);
    out.push({ title: l.text, url: l.href });
  }
  return out;
}

/** 공지 상세에서 쿠폰 추출. */
async function scrapeDetail(page: Page, url: string): Promise<ExtractedCoupon[]> {
  await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
  await sleep(3500);
  const body = await page.evaluate(() => document.body.innerText);
  const publishedAt = extractPublishedAt(body);
  const raw = extractCouponsFromBody(body);
  return raw.map((r) => ({
    code: r.code,
    rewardHint: r.rewardHint,
    sourceUrl: url,
    publishedAt,
  }));
}

/**
 * dokkaebi.ts 같은 Game 데이터 파일에 신규 쿠폰 레코드를 삽입한다.
 * anchor: `  coupons: [\n` 바로 뒤에 삽입.
 */
function appendCouponsToFile(gameFilePath: string, newCoupons: Coupon[]): void {
  const src = readFileSync(gameFilePath, "utf8");
  const anchor = "  coupons: [\n";
  const idx = src.indexOf(anchor);
  if (idx < 0) {
    throw new Error(`Could not find anchor '  coupons: [' in ${gameFilePath}`);
  }
  const insertAt = idx + anchor.length;
  const entries = newCoupons
    .map(
      (c) => `    {
      code: ${JSON.stringify(c.code)},
      reward: ${JSON.stringify(c.reward)},
      expiresAt: ${c.expiresAt === null ? "null" : JSON.stringify(c.expiresAt)},
      sourceUrl: ${c.sourceUrl ? JSON.stringify(c.sourceUrl) : "null"},
      collectedAt: ${c.collectedAt ? JSON.stringify(c.collectedAt) : "null"},
    },\n`,
    )
    .join("");
  const next = src.slice(0, insertAt) + entries + src.slice(insertAt);
  writeFileSync(gameFilePath, next, "utf8");
}

/** 게임 slug → 데이터 파일 경로 (관례: data/games/<slug>.ts) */
function gameFilePath(slug: string): string {
  return resolve(REPO_ROOT, "data", "games", `${slug}.ts`);
}

async function scrapeOne(page: Page, game: Game): Promise<Coupon[]> {
  const cfg = game.scrape;
  if (!cfg || !cfg.scrapeEnabled) {
    console.log(`[skip] ${game.slug}: scrape disabled`);
    return [];
  }
  console.log(`\n[${game.slug}] 공지 리스트: ${cfg.noticeListUrl}`);
  const notices = await collectNoticeUrls(page, cfg);
  console.log(`[${game.slug}] 쿠폰 키워드 포함 공지 ${notices.length}건`);

  const extracted: ExtractedCoupon[] = [];
  for (const n of notices) {
    try {
      const list = await scrapeDetail(page, n.url);
      if (list.length > 0) {
        console.log(`  - ${n.title}`);
        for (const c of list) {
          console.log(`      · code=${c.code}  rewardHint="${c.rewardHint}"`);
        }
      }
      extracted.push(...list);
    } catch (e) {
      console.warn(`  ! 공지 로드 실패: ${n.url} — ${(e as Error).message}`);
    }
  }
  const uniq = uniqByCode(extracted);
  const existingCodes = new Set(game.coupons.map((c) => c.code));
  // KST 기준 수집일 (CI runner는 UTC지만 사용자 사이트는 KST 공지 흐름을 따름)
  const today = new Date(Date.now() + 9 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const newOnes: Coupon[] = uniq
    .filter((e) => !existingCodes.has(e.code))
    .map((e) => ({
      code: e.code,
      // reward: 공지 원문 복사 금지 — 자체 요약 placeholder. 사용자가 손으로 다듬음.
      reward: e.rewardHint
        ? `${e.rewardHint} (공식 공지 참조)`
        : "공식 공지 참조",
      expiresAt: null,
      sourceUrl: e.sourceUrl,
      collectedAt: today,
    }));

  console.log(
    `[${game.slug}] 추출된 쿠폰 ${uniq.length}건 · 기존 ${existingCodes.size}건 · 신규 ${newOnes.length}건`,
  );
  return newOnes;
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/129.0.0.0 Safari/537.36",
    locale: "ko-KR",
  });
  const page = await context.newPage();

  let totalNew = 0;
  for (const game of GAMES) {
    try {
      const newCoupons = await scrapeOne(page, game);
      if (newCoupons.length === 0) continue;
      totalNew += newCoupons.length;
      if (DRY_RUN) {
        console.log(`[dry-run] ${game.slug}: ${newCoupons.length}건 신규 (파일 수정 skip)`);
        for (const c of newCoupons) console.log("  ", JSON.stringify(c));
      } else {
        appendCouponsToFile(gameFilePath(game.slug), newCoupons);
        console.log(`[write] ${game.slug}: ${newCoupons.length}건 레코드 삽입`);
      }
    } catch (e) {
      console.error(`[error] ${game.slug}:`, (e as Error).message);
      throw e;
    }
  }

  await browser.close();
  console.log(`\n=== 결과: 총 ${totalNew}건 신규 쿠폰 ${DRY_RUN ? "(dry-run)" : "반영"} ===`);
}

main().catch((e) => {
  console.error("[fatal]", e);
  process.exit(1);
});
