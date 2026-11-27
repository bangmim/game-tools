# gameting

신작 모바일 게임의 뽑기 확률과 공식 쿠폰을 한곳에서 확인하는 팬 메이드 비공식 도구입니다.

- 운영 사이트: [https://gameting.netlify.app](https://gameting.netlify.app)
- 저장소: [https://github.com/bangmim/game-tools](https://github.com/bangmim/game-tools)

게임사나 퍼블리셔가 운영하는 공식 서비스가 아닙니다. 게임 이미지와 로고를 사용하지 않고, 공식 공지에서 확인한 정보와 직접 계산한 수치를 중심으로 제공합니다. 쿠폰은 사이트에서 자동 등록하지 않으며 코드를 복사한 뒤 공식 입력 페이지에서 사용합니다.

## 현재 상태

| 게임 | 상태 | 제공 기능 | 검색 노출 |
|---|---|---|---|
| 도깨비의 세계 | 운영 데이터 제공 | 뽑기 확률 계산기, 공식 쿠폰, 초반 체크리스트 | 허용 |
| 템빨: 오버기어드 | 준비 중 | 기본 페이지 | `noindex`, 사이트맵 제외 |
| 이클립스: 더 어웨이크닝 | 준비 중 | 기본 페이지 | `noindex`, 사이트맵 제외 |

`develop`은 통합·검증 브랜치이고 `main`이 운영 배포 기준입니다. `develop`에 합쳐진 변경도 별도 릴리스로 `main`에 반영된 뒤 운영 사이트에 배포됩니다.

## 제공 기능

### 뽑기 확률 계산기

확률과 시도 횟수를 입력하면 다음 값을 브라우저에서 계산합니다.

- 한 번 이상 획득할 확률과 한 번도 획득하지 못할 확률
- 독립 시행 기준 평균 획득 개수
- 50%, 90%, 99% 목표 확률에 필요한 횟수
- 천장 횟수와 1회 비용을 입력했을 때 목표까지 필요한 비용

기본 계산은 독립 시행 공식 `1 - (1 - p)^n`을 사용합니다. 게임별 천장 초기화, 이월, 픽업 보정 등은 게임마다 다르므로 실제 규칙은 공식 확률 공시를 함께 확인해야 합니다.

### 공식 쿠폰 모음

- 공식 공지에서 확인한 쿠폰만 등재
- 코드 복사, 공식 입력 페이지 이동, 만료 여부 표시
- 공식 출처 URL과 수집일을 기록하고, 운영자가 확인한 항목에는 검증일도 기록
- 공식 공지의 보상 문구를 그대로 복제하지 않고 자체 요약

현재 자동 수집 대상은 도깨비의 세계입니다. Playwright 수집기가 공식 공지 목록과 본문만 확인하며, 댓글이나 비공식 쿠폰 사이트는 수집하지 않습니다. 공지 응답·본문·공식 URL 검증에 실패하면 데이터 기록을 중단합니다.

## 자동 수집과 릴리스

GitHub Actions의 `Scrape coupons` 워크플로가 매일 09:00 KST에 실행됩니다.

1. `scrapeEnabled: true`인 게임의 공식 공지를 확인합니다.
2. 새 쿠폰이 있으면 `data/games/`를 갱신해 `develop`에 커밋합니다.
3. `main`과 `develop` 사이에 `feat(scrape):` 커밋이 10개 이상 쌓이면 릴리스 알림 이슈를 만듭니다.
4. 검증한 변경을 `develop`에서 `main`으로 릴리스하면 Netlify가 정적 사이트를 빌드·배포합니다.

자동 수집은 운영 배포까지 수행하지 않습니다. `main` 반영 시점은 별도 릴리스 절차로 관리합니다.

## 기술 스택

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS 4
- Next.js static export (`output: "export"`)
- Netlify 정적 호스팅
- Playwright 기반 공식 공지 수집
- Node.js test runner 기반 회귀 테스트
- Google Analytics 4
- Google Analytics Data API + Netlify Functions (비공개 운영 대시보드)

## 로컬 실행

Netlify 운영 빌드와 맞춘 권장 환경은 Node.js 22와 pnpm 10입니다. GitHub Actions 수집 작업은 Node.js 20에서 별도로 실행됩니다.

```bash
pnpm install --frozen-lockfile
cp .env.example .env.local
pnpm dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

### 환경변수

| 변수 | 용도 | 미설정 시 |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | canonical, Open Graph, sitemap의 기준 URL | `https://gameting.netlify.app` 사용 |
| `NEXT_PUBLIC_GA_MEASUREMENT_ID` | GA4 Measurement ID | GA4 스크립트 비활성화 |
| `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | Google Search Console HTML 태그의 `content` 값 | Google 인증 메타 태그 생략 |
| `NEXT_PUBLIC_NAVER_SITE_VERIFICATION` | Naver Search Advisor HTML 태그의 `content` 값 | Naver 인증 메타 태그 생략 |
| `GA4_PROPERTY_ID` | 대시보드가 조회할 GA4 속성의 숫자 ID | 대시보드 API 비활성화 |
| `GA4_LINKTING_PROPERTY_ID` | 대시보드가 조회할 링크팅 웹 GA4 속성 ID | 링크팅 탭만 비활성화 |
| `GA4_SERVICE_ACCOUNT_EMAIL` | GA4 조회용 Google Cloud 서비스 계정 이메일 | 대시보드 API 비활성화 |
| `GA4_SERVICE_ACCOUNT_PRIVATE_KEY` | 서비스 계정 JSON의 개인키 | 대시보드 API 비활성화 |
| `GA4_DASHBOARD_ACCESS_TOKEN` | 개인 대시보드 접근 암호 | 대시보드 API 비활성화 |

운영 값은 `.env.local`이나 Netlify 환경변수에 저장합니다. `.env.local`과 비밀값은 커밋하지 않습니다.

### 개인용 GA4 대시보드 설정

운영 배포 후 `/admin/analytics/`에서 게임툴과 링크팅을 전환하며 최근 7일·28일 활성 사용자, 세션, 조회수, 참여율과 실시간 사용자, 인기 페이지, 유입 경로를 확인할 수 있습니다. 링크팅 탭은 퍼즐 시작·완료와 공유 이벤트도 최근 28일 기준으로 표시합니다. Google·Naver 등 `Organic Search`는 별도 집계해 검색 세션이 0인 상태와 단순 미표시를 구분합니다. 이 경로는 검색 색인과 사이트 자체 GA 페이지뷰 수집에서 제외됩니다.

1. Google Cloud 프로젝트에서 **Google Analytics Data API**를 사용 설정합니다.
2. 조회 전용 서비스 계정을 만들고 JSON 키를 한 번 발급합니다.
3. 게임툴과 링크팅 GA4의 `관리 > 속성 액세스 관리`에서 같은 서비스 계정 이메일을 각각 **뷰어**로 추가합니다.
4. 위 표의 서버 전용 변수 5개를 Netlify 환경변수에 등록합니다. 링크팅 속성 ID는 `558624156`입니다. 개인키는 저장소나 `NEXT_PUBLIC_` 변수에 넣지 않습니다.
5. 로컬에서 Netlify Function까지 확인할 때는 Netlify CLI의 `netlify dev`를 사용합니다. 일반 `pnpm dev`에서는 정적 화면만 확인할 수 있습니다.

접근 암호는 브라우저의 `sessionStorage`에만 저장되어 탭 세션이 끝나면 사라집니다. 서비스 계정 이메일·개인키와 GA4 속성 ID는 Netlify Function 안에서만 사용됩니다.

### 운영자 접속 제외

배포나 콘텐츠 확인에 쓰는 각 브라우저에서 사이트 주소 뒤에 `?internal=1`을 한 번 붙여 엽니다. 예: `https://gameting.netlify.app/?internal=1`. 해당 브라우저에 표식이 저장되고 이후 GA4 수집에서 제외됩니다. 하단의 **측정 다시 켜기**를 누르면 즉시 해제됩니다. 브라우저·프로필별 저장이므로 다른 노트북이나 휴대폰에서는 한 번씩 설정합니다.

### 검색엔진 등록

사이트는 canonical, `robots.txt`, `sitemap.xml`을 기본 제공합니다. Google Search Console과 Naver Search Advisor에서 HTML 태그 인증법을 선택한 뒤 발급된 `content` 값만 위의 공개 환경변수에 등록합니다. 배포가 끝나면 각 도구에 `https://gameting.netlify.app/sitemap.xml`을 제출합니다. 메타 태그는 소유권 확인만 돕고 검색 노출을 보장하지는 않습니다.

## 검증

```bash
pnpm lint
pnpm exec tsc --noEmit
pnpm exec tsx --test tests/*.test.ts
pnpm build
```

쿠폰 수집기를 파일 수정 없이 점검하려면 다음 명령을 사용합니다.

```bash
pnpm run scrape:coupons --dry
```

`pnpm build` 결과는 `out/`에 생성됩니다. Netlify는 `main` push를 기준으로 같은 빌드를 실행하고 `out/`을 배포합니다.

## 디렉터리 구조

```text
app/                     페이지, 메타데이터, robots, sitemap
components/              계산기·쿠폰·FAQ 등 공통 UI
data/games/              게임, 쿠폰, 초반 체크리스트 데이터
lib/                     확률 계산, 쿠폰 상태, 분석·사이트 설정
netlify/functions/       GA4 Data API 서버 함수
scripts/scrape-coupons.ts 공식 공지 쿠폰 수집기
tests/                   품질·정적 export·수집기 회귀 테스트
.github/workflows/       정기 쿠폰 수집 자동화
docs/HANDOFF.md           운영·아키텍처 인수인계 문서
```

새 게임은 `data/games/<slug>.ts`에 등록합니다. 공식 쿠폰·확률 공시 등 필요한 근거가 준비될 때까지 `indexable: false`를 유지해 검색 색인과 사이트맵에서 제외합니다.

## 분석과 개인정보

운영 사이트는 GA4로 페이지 조회, 유입 경로, 접속 환경을 집계합니다. 계산기에 입력한 확률·횟수·비용은 브라우저 안에서만 계산되며 GA4로 보내지 않습니다. 회원가입과 로그인 기능도 없습니다.

세부 내용은 운영 사이트의 [개인정보처리방침](https://gameting.netlify.app/privacy/)에서 확인할 수 있습니다. AdSense는 아직 도입 전이며, 도입 시 개인정보 및 광고 동의 안내를 함께 갱신합니다.

## 남은 작업

- 템빨: 오버기어드와 이클립스의 공식 사이트·쿠폰·확률 공시 확인
- 다음 지원 게임 선정과 공식 근거 기반 데이터 추가
- GA4 내부 트래픽 필터는 사용자 결정에 따라 보류
- 유입과 콘텐츠가 충분해진 뒤 AdSense 신청 여부 판단

## 관련 문서

- [PLAN.md](./PLAN.md): 승인 범위, 결정 사항, 남은 작업
- [CLAUDE.md](./CLAUDE.md): 브랜치·릴리스·콘텐츠 수집 규칙
- [docs/HANDOFF.md](./docs/HANDOFF.md): 운영과 아키텍처 인수인계
- [.env.example](./.env.example): 로컬 환경변수 예시
- [.github/workflows/scrape-coupons.yml](./.github/workflows/scrape-coupons.yml): 쿠폰 자동 수집 워크플로

## 문의

잘못된 쿠폰 정보, 공식 출처 정정, 저작권·상표 관련 삭제 요청은 [akiyun10@gmail.com](mailto:akiyun10@gmail.com)으로 보내주세요.

## GitHub 검사와 이슈 추적

`CI`는 PR과 `develop`·`main` push에서 타입 검사와 기존 테스트를 실행합니다. lint가 구성된 저장소는 lint도 실행합니다. PR 실패는 PR 검사 결과로 남기고, GitHub 기본 브랜치의 push CI 실패만 이슈로 등록합니다. 반복 실패는 열린 CI 이슈에 모으며 같은 실행 시도는 중복 기록하지 않습니다. 원인이 다른 실패는 확인 후 이슈를 분리합니다. 실제 실행 로그는 GitHub 링크로 확인하고 비밀값이나 전체 로그는 이슈에 복사하지 않습니다.

CI는 EAS·OTA·스토어 제출·네이티브 빌드·운영 배포를 실행하지 않습니다. AI 리뷰 연결과 필수 검사 브랜치 보호는 별도 설정입니다. `workflow_run` 이슈 workflow는 기본 브랜치에 있어야 활성화되므로 `develop` 반영만으로 기본 브랜치 활성화가 완료됐다고 판단하지 않습니다.

정적 export 결과를 읽는 `tests/export.test.ts`는 빌드 승인이 필요한 별도 검증으로 남기고 이 CI에는 포함하지 않습니다. 쿠폰 수집 workflow의 `develop` 직접 push는 유지합니다. GitHub Actions 토큰이 만든 push는 다른 workflow를 자동 실행하지 않을 수 있으므로 쿠폰 수집 성공을 CI 통과로 표현하지 않습니다.

`.github/branch-protection.json`은 `main` 보호 설정 후보이며 자동으로 적용되지 않습니다. 실제 CI의 `verify` 검사·GitHub Actions 앱을 확인한 뒤 적용합니다. `develop` 보호는 기존 자동 push 여부를 따로 확인해야 하며, 쿠폰 수집처럼 직접 반영하는 자동화가 있는 브랜치에는 이 PR 필수 규칙을 그대로 적용하지 않습니다.
