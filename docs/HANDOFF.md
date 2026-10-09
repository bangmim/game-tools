# 게임 도구 사이트 (gameting) — 세션 핸드오프

> 작성: 2026-10-09 · 트랙 D 1차 완결 시점
> 용도: 다른 Claude 세션에서 이어서 작업할 때 전체 맥락을 1분에 파악
> 선행 문서: `~/Downloads/session_handoff_웹게임도구사이트프로젝트.md` (ChatGPT 시절 원본 기획)

---

## 0. 빠른 요약 (30초)

- **무엇**: 신작 모바일 게임의 뽑기 확률 계산기 + 공식 쿠폰 모음 사이트 (팬 메이드 비공식 도구)
- **왜**: 광고 수익 사이드프로젝트. 포트폴리오는 부가 효과이지 주 목표 아님
- **라이브**: https://gameting.netlify.app
- **리포**: https://github.com/bangmim/game-tools (**public**)
- **첫 대상 게임**: 도깨비의 세계 (카카오게임즈, 2026-10-08 출시)
- **스택**: Next.js 16 (App Router, static export) + Tailwind v4 + Netlify
- **운영 방식**: `git push` → Netlify 자동 CI → 자동 빌드/배포
- **상태**: 운영 체제 구축 완료, 쿠폰·게임 추가가 핵심 운영 활동

---

## 1. 프로젝트 정체성

### 1.1 수익 모델

AdSense 광고 수익. 아직 신청 전 (유입 쌓인 뒤 신청 예정).

**결정 요인**: 운영 속도와 SEO 선점이 수익 결정. 코드 자체는 경쟁 우위 X (뽑기 공식 = 수학, 쿠폰 = 공식 공개 정보).

### 1.2 포지셔닝

| 원칙 (핸드오프 §10 유지) | 왜 |
|---|---|
| 게임 이미지·로고 안 씀, 수치·텍스트 중심 | 저작권 리스크 회피, 번들 가볍게 |
| "팬이 만든 비공식 도구" 명시 (모든 페이지) | 게임사와 혼동 방지, 법적 안전 |
| 쿠폰 자동 등록 X — 코드 복사 + 공식 링크만 | 공식 쿠폰 페이지 약관 리스크 회피 |
| 광고는 최소한만 | 경쟁 상위 앱의 "광고 과다" 불만 반대 포지션 |
| 신작 게임 출시 직후 진입 | 도구가 아직 없는 시기 = 경쟁 낮음 |

### 1.3 반복 가능한 구조

**게임 1개 추가 = 파일 하나 추가**. 아래 섹션 3.2 참고.

---

## 2. 현재 상태

### 2.1 라이브 URL

| 경로 | 역할 |
|---|---|
| `/` | 랜딩 (Hero + 왜 이 사이트? 3-카드 + 지원 게임 리스트 + 설명) |
| `/dokkaebi/` | 게임 홈 (게임 소개 + 메뉴 2개) |
| `/dokkaebi/gacha/` | 뽑기 확률 계산기 (안내 + 공식 공시 링크 + 계산기 + FAQ 4개) |
| `/dokkaebi/coupon/` | 쿠폰 모음 (안내 + 쿠폰 3개 + FAQ 3개) |
| `/privacy/` | 개인정보처리방침 (AdSense 신청 대비) |
| `/robots.txt` | 전체 허용 + sitemap 포인터 |
| `/sitemap.xml` | 5개 URL 자동 생성 |
| `/opengraph-image` | 1200×630 PNG 자동 생성 (브랜드 그라데이션) |
| `/icon.svg` | favicon ("GT" 로고) |
| 404 | 커스텀 페이지, 홈 복귀 버튼 |

### 2.2 Netlify 설정

- **Site ID**: `.netlify/state.json` 에 저장 (gitignored)
- **Team**: `mihyun`
- **플랜**: Starter (무료)
- **환경변수**: `NEXT_PUBLIC_SITE_URL=https://gameting.netlify.app` (대시보드 등록 완료)
- **자동 CI**: GitHub 연결됨, **`main` 브랜치 push 시** 자동 빌드/배포 (브랜치 모델 전환 후에도 트리거는 `main` 유지, §7.8)
- **대시보드**: https://app.netlify.com/projects/gameting

### 2.3 GitHub 리포

- **Owner**: `bangmim` (사용자 ID)
- **Visibility**: **public** (수익화 관점에서도 운영 속도상 유리하다고 판단)
- **Default branch**: `develop` (2026-10-09 전환, §7.8). `main`은 Netlify production 트리거 전용 (= 배포 반영 지점)
- **브랜치 모델**: `feat/*|fix/*|chore/*|docs/*|refactor/*|test/*` → `develop` → (안정화 묶음, 주 1회 등) → `main` (= 라이브 배포)
- **커밋 작성자**: `bangmim <akiyun10@gmail.com>`

### 2.4 소유권 인증 상태

| 서비스 | 소유권 인증 | sitemap 제출 |
|---|---|---|
| Google Search Console | ✅ 완료 (`public/googlebd738b77da889df4.html`) | ⏳ 사용자 수동 (왼쪽 Sitemaps 메뉴) |
| 네이버 서치어드바이저 | ⏳ 파일 올림, 콘솔에서 "확인" 재클릭 필요 (`public/naverd39c59075779d757d38893b186b86355.html`) | ⏳ 소유권 통과 후 |

---

## 3. 아키텍처

### 3.1 디렉토리

```
~/apps/game-tools/
├── app/
│   ├── layout.tsx                  # 전역 메타, WebSite JSON-LD
│   ├── page.tsx                    # 랜딩
│   ├── not-found.tsx               # 커스텀 404
│   ├── icon.svg                    # favicon
│   ├── opengraph-image.tsx         # OG PNG 생성 (next/og, dynamic='force-static')
│   ├── robots.ts                   # dynamic='force-static'
│   ├── sitemap.ts                  # dynamic='force-static', GAMES 레지스트리 기반
│   ├── globals.css                 # Tailwind v4 @theme + Pretendard CDN
│   ├── privacy/page.tsx            # 개인정보처리방침
│   └── [game]/
│       ├── layout.tsx              # generateStaticParams, Breadcrumb JSON-LD, 네비
│       ├── page.tsx                # 게임 홈
│       ├── gacha/page.tsx          # 계산기 (WebApplication JSON-LD, FAQ)
│       └── coupon/page.tsx         # 쿠폰 (FAQ)
├── components/
│   ├── GachaCalculator.tsx         # "use client", 입력/결과/프리셋
│   ├── CouponList.tsx              # 서버 컴포넌트, 정렬·만료 처리
│   ├── CopyButton.tsx              # "use client", clipboard
│   ├── Disclaimer.tsx              # 전역 푸터 + /privacy 링크
│   ├── Faq.tsx                     # <details> 기반 아코디언
│   └── JsonLd.tsx                  # </script> escape 방어 코드 포함
├── lib/
│   ├── gacha.ts                    # 공식: 1-(1-p)^n, 천장·비용 지원
│   └── site.ts                     # SITE_URL, SITE_NAME, DEFAULT_KEYWORDS
├── data/games/
│   ├── types.ts                    # Game, Coupon 타입
│   ├── index.ts                    # GAMES 배열, getGame(slug)
│   └── dokkaebi.ts                 # 도깨비의 세계 데이터
├── public/
│   ├── googlebd738b77da889df4.html # Google 소유권 인증
│   └── naverd39c59075779d757d38893b186b86355.html  # 네이버 소유권 인증
├── next.config.ts                  # output: 'export', trailingSlash: true
├── netlify.toml                    # 보안 헤더 + 캐시 헤더
├── .env.local                      # NEXT_PUBLIC_SITE_URL (gitignored)
└── docs/HANDOFF.md                 # 이 문서
```

### 3.2 데이터 모델 (게임 추가 패턴)

**새 게임 하나 추가 = `data/games/<slug>.ts` 하나 + `index.ts` 등록**. 라우팅/페이지/sitemap 모두 자동 생성.

```typescript
// data/games/types.ts
export type Game = {
  slug: string;              // URL 세그먼트 (예: "dokkaebi")
  name: string;              // 노출명
  publisher: string;
  releasedAt: string;        // "YYYY-MM-DD"
  tagline: string | null;    // 게임 홈 한 줄 소개 (null이면 숨김)
  couponUrl: string | null;  // 공식 쿠폰 입력 페이지
  probabilityUrl: string | null;  // 공식 확률 공시 페이지
  ratePresets: number[];     // 계산기 확률 프리셋 (%)
  triesPresets: number[];    // 계산기 횟수 프리셋
  coupons: Coupon[];
  keywords: string[];        // SEO: "<게임명> + 쿠폰/뽑기/확률/천장" 등
};

export type Coupon = {
  code: string;
  reward: string;
  expiresAt: string | null;  // null이면 "기간 제한 없음"
};
```

### 3.3 라우팅

Next.js App Router, `[game]` 동적 세그먼트.
`generateStaticParams()`가 `GAMES` 레지스트리에서 slug 뽑아 사전 생성 → **100% static export** (`output: 'export'`).

### 3.4 디자인 토큰

`app/globals.css` 의 `@theme` (Tailwind v4 CSS-first config):

```css
--color-bg: #edf0fa;
--color-ink: #1c1f4a;
--color-brand: #3442c4;
--color-accent: #ffc83d;
--color-border: #d5daf0;
--font-sans: Pretendard (CDN) → system fallback
```

사용 시 `bg-[var(--color-brand)]` 같은 임의 값 문법.

### 3.5 SEO

- **메타**: 페이지별 `generateMetadata` + 글로벌 `metadataBase`
- **sitemap**: 레지스트리 기반 자동, `/privacy/` 포함
- **robots**: 전체 허용
- **JSON-LD 3종**: WebSite (랜딩), BreadcrumbList (게임 하위), WebApplication (가챠)
- **OG image**: `app/opengraph-image.tsx` → 자동 PNG
- **keywords**: 각 게임별 `game.keywords` (예: "도깨비의 세계 쿠폰", "뽑기 확률", "천장")

### 3.6 보안

| 레이어 | 설정 |
|---|---|
| `netlify.toml` HTTP 헤더 | X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy (camera/mic/geo/interest-cohort 거부), HSTS 2년+preload (Netlify가 1년으로 조정), CSP (Next.js inline hydration 때문에 'unsafe-inline' 포함) |
| `JsonLd` 컴포넌트 | `<` → `<`, `-->` → `-->` escape → `</script>` 조기 종료 리스크 차단 |
| 비밀 관리 | `.env.local` gitignored, 민감 정보 커밋 없음 |
| 외부 링크 | 전부 `rel="noopener noreferrer"` |

---

## 4. 운영 흐름

### 4.1 코드 수정 → 배포 (일상, 2026-10-09 전환 후)

**브랜치 흐름**: `feat/*` (작업) → `develop` (통합/스테이징) → `main` (= 라이브 배포)

```bash
cd ~/apps/game-tools

# 1. develop 최신화 + 작업 브랜치 분기
git checkout develop && git pull
git checkout -b feat/add-coupon-xyz    # 네이밍: ^(feat|fix|chore|docs|refactor|test)/[a-z0-9-]+$

# 2. 수정 (예: data/games/dokkaebi.ts 에 쿠폰 추가)

# 3. 커밋 + push + develop 머지 — 반드시 `/cnp --merge` 로만 (CLAUDE.md 규칙)
#    /cnp         → 커밋 + 현재 브랜치 origin push (develop 머지 X)
#    /cnp --merge → 위 + develop 머지 + origin/develop push + 작업 브랜치 삭제 질문

# 4. (주 1회 등 안정화 지점) develop → main 머지 → Netlify 자동 배포 트리거
#    사용자가 수동으로 묶어서 올리거나, 별도 세션에서 지시
```

> **중요**: develop에 push해도 라이브 반영 안 됨 (Netlify 트리거는 `main`). develop은 통합·스테이징 역할.

### 4.2 수동 배포 (CI 실패 백업용)

```bash
pnpm deploy  # = next build && netlify deploy --prod --dir=out
```

### 4.3 로컬 개발

```bash
pnpm dev  # http://localhost:3000
```

### 4.4 새 게임 추가 (예: 템빨: 오버기어드)

```bash
# 0. develop 최신화 + 작업 브랜치
git checkout develop && git pull
git checkout -b feat/add-tempal

# 1. 데이터 파일 생성
cat > data/games/tempal.ts <<'EOF'
import type { Game } from "./types";

export const tempal: Game = {
  slug: "tempal",
  name: "템빨: 오버기어드",
  publisher: "넥슨",
  releasedAt: "2026-11-XX",
  tagline: null,
  couponUrl: null,
  probabilityUrl: null,
  ratePresets: [0.5, 1, 3],
  triesPresets: [10, 50, 100],
  coupons: [],
  keywords: ["템빨", "템빨 오버기어드", "템빨 쿠폰", "템빨 뽑기 확률"],
};
EOF

# 2. 레지스트리 등록
# data/games/index.ts 수정:
#   import { tempal } from "./tempal";
#   export const GAMES: Game[] = [dokkaebi, tempal];

# 3. 커밋 + develop 머지 (사용자가 `/cnp --merge` 입력)
# → origin/develop 반영. 라이브 반영은 develop → main 머지 시점.
```

### 4.5 쿠폰 추가/수정

`feat/*` 브랜치 분기 → `data/games/<slug>.ts` 의 `coupons` 배열 수정 → `/cnp --merge`로 develop 반영 → (주 1회) develop→main 머지로 라이브.

```typescript
coupons: [
  { code: "NEWCODE", reward: "다이아 500개", expiresAt: "2026-12-31" },
  // 기존 쿠폰 유지
  { code: "도깨비1008", reward: "꿀떡 무기 외형", expiresAt: null },
  ...
]
```

만료일 지난 쿠폰은 **삭제하지 말고 `expiresAt` 유지** — `CouponList.tsx` 가 자동으로 "만료된 쿠폰" 섹션으로 분리.

---

## 5. 완료된 작업 (커밋 기록)

```
3e12126  chore(seo): add Google + Naver site verification files
95bc44a  chore: add 'pnpm deploy' script
b13583c  security: add HTTP headers, harden JsonLd, untrack .agents
fbd1796  feat(launch-polish): favicon, OG image, 404, privacy policy
5fb9418  chore(deploy): switch Firebase Hosting → Netlify
bdab195  feat(dokkaebi+hosting): fill real data + Firebase Hosting config
1c110e9  feat(seo+ux): sitemap/robots/JSON-LD, hero landing, FAQ, bigger result banner
c835862  chore: scaffold Next.js 16 game-tools with dokkaebi stub
```

> `7471db0 test: trigger CI` 중간에 있음 (Netlify CI 테스트용 더미 커밋, 유지)

### 완료 항목 체크

- [x] Next.js 16 scaffold + Tailwind v4 + static export
- [x] 랜딩/게임홈/가챠/쿠폰 4개 라우트 + 404 + privacy
- [x] 레지스트리 기반 동적 라우팅 (`generateStaticParams`)
- [x] 디자인 토큰 (Pretendard, 브랜드 색)
- [x] 도깨비 실데이터 (쿠폰 3개, 공식 URL 2개)
- [x] SEO: sitemap, robots, JSON-LD 3종, OG image, keywords
- [x] 보안: HTTP 헤더 6종, JsonLd escape
- [x] favicon (SVG, "GT")
- [x] Netlify 배포 (gameting.netlify.app)
- [x] GitHub 리포 생성 + public 전환
- [x] 자동 CI (git push → 자동 배포)
- [x] Google 소유권 인증
- [x] 네이버 소유권 파일 올림 (확인 재시도만 남음)

---

## 6. 남은 작업 (우선순위 순)

### 🔴 지금 당장 (사용자 수동)
- [ ] **Orca 사이드바 "+" 버튼** → "Open folder" → `/Users/mihyunpark/apps/game-tools` 선택 (수정 사항 확인용)
- [ ] **네이버 서치어드바이저** 콘솔에서 "확인" 재클릭 → 소유권 통과 → sitemap 제출 (`sitemap.xml`)
- [ ] **Google Search Console** 왼쪽 Sitemaps → `sitemap.xml` 제출

### 🟡 이번 주
- [ ] **도깨비의 세계 커뮤니티 모니터링** — 공식 라운지(forum.kakaogames.com)·디시 등에서 반복되는 질문 수집. 2~3일 간격
  - "뭐부터 키워야 함?" 반복 → 초반 체크리스트 페이지 (`/dokkaebi/beginner/`)
  - "직업 뭐가 좋음?" 반복 → 도술 12계열 가이드
  - 신규 쿠폰 공지 → `data/games/dokkaebi.ts` 추가
- [ ] **AdSense 신청** — 콘텐츠 어느 정도 쌓이고 유입 몇 명/일 되면

### 🟢 11월 (사전등록 중인 게임)
- [ ] **템빨: 오버기어드** (넥슨) 추가 — §4.4 패턴 따라 1시간 작업
- [ ] 출시일 확정되면 확률표·쿠폰 리서치 + 반영

### 📋 백로그 (핸드오프 §4 후보 게임)
- 제우스: 오만의 신 (컴투스, 이미 흥행 중) — 이미 선점된 영역 가능성, 검색량 확인 선행
- 이클립스: 더 어웨이크닝 (스마일게이트)
- 던전앤파이터 키우기 (방치형, 효율 계산 수요 ↑)
- 나 혼자만 레벨업: 카르마 (넷마블, 연내 예정)
- Slay the Spire 2 (영어로 만들면 해외 트래픽 가능)

### 🔧 기술 백로그 (급하지 않음)
- [ ] HSTS 2년 설정 반영 재시도 (Netlify가 1년으로 조정됨 — 보안엔 영향 없음)
- [ ] Pretendard self-host 또는 SRI 해시 추가 (현재 CDN 로드)
- [ ] Netlify Analytics 또는 GA/PostHog 도입 (유입 측정 필요해지면)

---

## 7. 의사결정 기록 (왜 이렇게 했는가)

### 7.1 Firebase Hosting → Netlify (커밋 `5fb9418`)

- 핸드오프 §7-3이 Firebase를 명시했지만 선택 근거가 없었음
- **Netlify 선택 이유**: translator-feed/pill-reminder와 통일 / 무료 대역폭 10× (10GB → 100GB) / 외부 세팅 비용 낮음 (서비스 계정 발급 불필요) / Firestore 안 쓰는 순수 정적 사이트라 Google 생태계 결합 이점 없음

### 7.2 Private → Public (수익화 관점에서도 유리)

- Private + Starter 플랜 = **자동 CI 못 씀** (contributor 1명 제한)
- "쿠폰 노하우 유출" 걱정 vs "운영 속도 저하 손해" — 후자가 더 큼
- 쿠폰은 공식 공개 정보라 숨길 가치 X. 비즈니스 로직은 수학 공식 수준
- 수익 결정 요인 = SEO 선점 + 쿠폰 업데이트 속도 → 자동 CI가 운영 속도에 유리

### 7.3 Gemini 3.8-flash vs Qwen3.8-27B 아님 — **이 프로젝트에 LLM 없음**

- `translator-feed` 세션에서 뽑은 교훈 ([블로그 #12](https://mifine.tistory.com) 참조): "확신 있는 틀린 답" 리스크 때문에 신조어 번역기 폐기
- 이 사이트는 **LLM 호출 없음** — 뽑기 공식은 수학, 쿠폰은 사람이 수집
- 미래에 쿠폰 자동 수집에 LLM 쓰고 싶으면 "모르면 모른다" 설계 필수

### 7.4 Tailwind v4 CSS-first 설정

- Next.js 16이 자동 설치. `tailwind.config.js` 없음, `app/globals.css`의 `@theme` 블록에 토큰 정의
- 색 변수는 `var(--color-brand)` 식 CSS 변수로 접근 (임의 값 `bg-[var(--color-brand)]`)

### 7.5 `output: 'export'` + Netlify (SSR 안 씀)

- 지금 사이트에 서버 상태 없음 (사용자 입력 저장 X, 로그인 X)
- `output: 'export'` = 100% 정적 HTML → Netlify static CDN 서브 → 빠름, 무료 플랜 대역폭 여유
- `@netlify/plugin-nextjs` 플러그인 **불필요** (SSR 안 쓰므로)
- `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` 는 `export const dynamic = "force-static"` 명시 필수

### 7.6 쿠폰 자동 등록 안 함

- 공식 쿠폰 입력 페이지를 자동으로 건드리면 **약관 리스크** (핸드오프 §3)
- 복사 버튼 + 공식 페이지 링크만 제공

### 7.7 `.agents/` 디렉토리 untrack

- Netlify CLI가 `netlify init` 때 자동 설치 (Netlify의 AI 에이전트 스킬 가이드, 380KB)
- 공개 사이트와 무관, 리포 노이즈 제거 위해 `.gitignore` + `git rm --cached`

### 7.8 main-only → develop + feat/* 전환 (2026-10-09)

- **기존**: main 직접 push → Netlify 자동 배포 (혼자 운영 전제, 이전 §8의 "PR 과함" 판단)
- **변경 후**: `feat/*|fix/*|...` 작업 브랜치 → `develop` (통합/스테이징) → (안정화 묶음, 주 1회 등) → `main` (= 배포)
- **전환 이유**:
  - 다른 Claude 프로젝트와 통일된 브랜치 흐름 (CLAUDE.md 규칙과 일치)
  - 롤백 지점 명확화 (main의 각 커밋 = 라이브에 올라간 배포 단위)
  - 머지 전 스테이징으로 "실험 커밋이 바로 라이브" 리스크 제거
  - subagent isolation(워크트리) 패턴을 쓰려면 base 브랜치가 필요
- **Netlify 트리거**: 그대로 `main` push 유지 (develop 자동 배포 X — develop은 통합 지점)
- **GitHub default branch**: `main` → `develop` (사용자가 리포 Settings → General → Default branch에서 전환 필요. 또는 `gh api -X PATCH /repos/bangmim/game-tools -f default_branch=develop`)
- **CLAUDE.md 규칙**: 커밋/push/머지는 반드시 `/cnp` 또는 `/cnp --merge`로만. Claude가 직접 `git commit/push/merge` 실행 금지.

---

## 8. 지켜야 할 원칙

### 콘텐츠
- **게임 이미지·로고 사용 금지** — 수치·텍스트만
- **"비공식 팬 도구" 명시** — 모든 페이지의 `<Disclaimer />` 전역 노출
- **쿠폰은 공식 공지 기준** — 커뮤니티 유출 쿠폰은 넣지 말 것 (분쟁 리스크)
- **쿠폰 자동 등록 X** — 복사 버튼과 공식 링크만

### 코드
- 새 라우트에 **`<Disclaimer />` 포함 확인**
- `app/sitemap.ts`, `app/robots.ts`, `app/opengraph-image.tsx` 수정 시 `dynamic = "force-static"` 유지
- JSON-LD 추가 시 `<JsonLd>` 컴포넌트 재사용 (raw `<script>` 쓰지 말 것 — escape 안 됨)
- 외부 링크엔 `target="_blank" rel="noopener noreferrer"`
- 환경변수는 `NEXT_PUBLIC_` 접두어만 클라이언트 노출. 비밀은 Netlify 대시보드에만

### 운영
- **`main` 직접 push 금지** (2026-10-09 전환, §7.8). 모든 변경은 `feat/*|fix/*|...` → `develop` → (주 1회 등) → `main`
- 브랜치 네이밍 정규식: `^(feat|fix|chore|test|docs|refactor)/[a-z0-9-]+$` (예: `feat/add-coupon-xyz`)
- 커밋/push/머지는 **반드시 `/cnp` 또는 `/cnp --merge`로만** (Claude가 직접 `git commit/push/merge` 실행 금지, CLAUDE.md 규칙)
- Netlify 라이브 반영은 **`main` push 시점** — develop 머지만으로는 배포 안 됨
- 쿠폰 만료되어도 `expiresAt` 유지 — 삭제 X (`CouponList`가 자동 분리)
- 쿠폰 추가 시 **커밋 메시지에 출처** 명시 (예: "feat(dokkaebi): 공식 공지 쿠폰 XX 추가 (2026-10-15)")

### 보안
- `.env.local` 절대 커밋 X (`.gitignore` 커버됨)
- `netlify.toml` 보안 헤더 블록 **삭제·완화 금지** — 공개 사이트
- CSP 수정 시 외부 리소스 추가가 필요한지 체크 (현재 Pretendard CDN만 허용)

---

## 9. 블로커 / 외부 액션

### 사용자만 할 수 있는 것
- Netlify 대시보드 조작 (env 등록, 자동 CI 재시도, 접근 제어)
- Google Search Console / 네이버 서치어드바이저 소유권 확인·sitemap 제출
- AdSense 신청 (유입 쌓인 뒤)
- 커뮤니티 모니터링 (사람 손)
- 도메인 구매 (현재 netlify.app 서브도메인, 커스텀 도메인은 선택)

### Claude 세션에서 할 수 있는 것
- 코드 수정, 게임/쿠폰 추가, 빌드, git push → 자동 배포
- 리서치 (WebSearch, 쿠폰 수집, 신규 게임 조사)
- 디자인 개선, 새 페이지 추가 (초반 체크리스트, 도술 가이드 등)
- 블로그 글 작성 (티스토리 "사이드 프로젝트" 카테고리)

---

## 10. 다음 세션 시작 메시지 (복붙용)

```
~/apps/game-tools 프로젝트를 이어서 작업할게.
먼저 docs/HANDOFF.md 를 읽고 현재 상태 파악해줘.

이번 세션에서 할 일: <여기에 구체 작업>
  예시:
  - 도깨비의 세계 신규 쿠폰 N개 반영 + 재배포
  - 템빨: 오버기어드 데이터 추가 (11월 출시)
  - "초반 체크리스트" 페이지 추가 (/dokkaebi/beginner/)
  - AdSense 신청 전 콘텐츠 보강

진행 전에 확인:
- git status, git log --oneline -5
- 라이브 사이트: https://gameting.netlify.app
- Netlify 자동 CI 작동 중이므로 git push 하면 배포됨
```

---

## 11. 참고 자료

### 외부 문서
- **원본 기획 (ChatGPT 세션 산출물)**: `~/Downloads/session_handoff_웹게임도구사이트프로젝트.md`
- **사용자 블로그 (티스토리)**: https://mifine.tistory.com — "사이드 프로젝트" 카테고리에 과정 기록 예정
- **블로그 아이디어 뱅크**: `~/docs/blog/_아이디어-뱅크.md`
- **번역기 폐기 회고 (교훈 원천)**: `~/docs/blog/12-오답노트-LLM만-믿고-서비스-만들면-안-되는-이유.md`

### 공식 리소스 (도깨비의 세계)
- 공식 쿠폰 입력: https://coupon.kakaogames.com/dokkaebi/ko/
- 공식 확률 공시: https://forum.kakaogames.com/dokkaebi/postView/?code=prob&id=9333
- 공식 커뮤니티: https://bbs.kakaogames.com/ko/1329429/event/list
- 나무위키: https://namu.wiki/w/도깨비의세계

### 사용자 다른 관련 프로젝트 (매칭 테이블)
| 프로젝트 | 경로 | 성격 |
|---|---|---|
| translator-feed | `~/orca/translator-feed` | 접음 (LLM hallucination 리스크) |
| simple-money-log | `~/simple-money-log` | 딱,가계부 — Private, Supabase→Firebase 전환 완료 |
| pill-reminder | `~/apps/pill-reminder` | 1호 Expo 앱 진행 중 |
| **game-tools** | `~/apps/game-tools` | **이 프로젝트** |
| workspace/fe | `~/workspace/fe` | 회사 코드 (모꼬지/보험아카이브) |

### 사용자 정체성 (요약)
- 프론트엔드 개발자 (React Native 중심, 3년 차)
- GitHub: `bangmim` / 이메일: `akiyun10@gmail.com`
- 전략: 3개월에 Expo 안드로이드 앱 4~6개 + 웹 사이트 몇 개로 **확률 쌓기** (단일 대박 X)
- 톤: 짧고 핵심부터, 솔직한 보고 선호, "제대로 체크" 중시 (성의 없는 보고 거부)

---

## 변경 로그

| 날짜 | 섹션 | 변경 |
|---|---|---|
| 2026-10-09 | 전체 | 최초 작성 (트랙 D 1차 완결 시점) |
| 2026-10-09 | §2.2, §2.3, §4.1, §4.4, §4.5, §7.8, §8 | main-only → `feat/*` → `develop` → `main` 브랜치 모델로 전환. Netlify 배포 트리거는 `main` 유지. |
