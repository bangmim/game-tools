# game-tools 작업 플랜

> 이 파일은 Claude Code가 작업 전 반드시 끝까지 읽습니다.
> 작성일: 2026-10-10 · 유효 범위: 다음 1~2 세션

## 목표
도깨비 공식 공지 쿠폰을 매일 자동 수집해 develop에 반영하는 CI를 돌리고, 이어서 지원 게임 1~2개를 추가해 사이트 폭을 넓힌다.

## 범위
- [x] 지난 세션 결정 반영 커밋 (`da2b40b` docs/plan-md-cleanup) — 완료.
- [x] 쿠폰 자동 수집 CI (도깨비 전용) — 이번 세션. Playwright headless + GAMES 레지스트리 기반, `data/games/types.ts`에 `ScrapeConfig` optional 필드 추가, `data/games/dokkaebi.ts`에만 `scrapeEnabled: true`. workflow가 매일 UTC 00:00(KST 09:00) 돌면서 신규 쿠폰이 있으면 `feat(scrape):` 커밋으로 develop에 직접 push. main↔develop diff에 `feat(scrape):` 커밋이 10개 이상 쌓이면 `release-reminder` 라벨 Issue 자동 생성 (open 상태 중복 방지). 수동 트리거(workflow_dispatch)도 지원.
- [ ] 지원 게임 1~2개 추가 (다음 작업).

## 미확정 사항
- [ ] `develop → main` 머지 주기·트리거 기준 구체화 (요일 고정? 쿠폰 N개 쌓이면? docs-only는 묶음 대기?)
      → 쿠폰 자동 수집 CI는 "10건 쌓이면 Issue"로 release 트리거 알림을 자동화했지만, docs/feat 혼합분을 어느 주기로 묶을지는 여전히 미결.
- [ ] AdSense 신청 기준 수치화 (일 유입 N명/일, 추가 페이지 M개 이후 등)
- [ ] Netlify Analytics vs GA / PostHog 도입 시점·수단 선정 (AdSense 신청 전 유입 측정 필요)
- [ ] 다음 세션에 추가할 지원 게임 후보 선정 — 제우스 / 이클립스 / 나혼자만 레벨업 카르마 중 어느 쪽을 먼저 올릴지. 공식 공지 접근성(SPA 여부·쿠폰 공지 패턴 유사성)과 신작 유입 기대치가 선정 기준.

## 결정 기록
- 2026-10-09 · 브랜치 모델을 `main` 직접 push → `feat/* → develop → main` 로 전환. Netlify 배포 트리거는 `main` 유지. (HANDOFF.md §7.8, 커밋 `d37b0d3`, 머지 `ce7361a`)
- 2026-10-09 · GitHub default branch는 이미 `develop`으로 설정되어 있는 것 확인 (`gh api` 조회).
- 2026-10-09 · 이번 PLAN 범위에 "도메인 구매"는 포함 안 함 — 현재는 netlify.app 서브도메인 유지.
- 2026-10-09 · 기존 도깨비 쿠폰 3건의 `expiresAt: null` 품질 — 뉴스 소스가 특정 만료일(11-11, 11-07 등)을 암시하지만 공식 공지로 교차검증 안 됨. **공식 교차검증 전까지 null 유지** (뉴스 추정값으로 수정 X). 사이트에서는 "기간 제한 없음"으로 표시되지만, 틀린 날짜 넣는 것보다 보수적으로 안전. HANDOFF §7.3 (translator-feed 교훈) 적용.
- 2026-10-09 · 병렬 작업 세션 결과 (R·C·S·X·Chair): R은 공식 미검증으로 no-commit (브랜치 폐기), C는 Critic 지적 반영해 축소판 재작성 후 머지 대기, S는 미세 수정 후 머지 대기. 회의록·근거는 세션 로그에 보존.
- 2026-10-10 · SPA 공식 공지 수집용 Playwright 도입 완료 — `scripts/scrape-coupons.ts` + GitHub Actions `scrape-coupons.yml`. 추출은 **정규식 + CSS selector만** (LLM 사용 금지, HANDOFF §7.3 hallucination 방지). 대상은 `scrapeEnabled: true` Game만, 현재는 도깨비 하나. reward 필드는 공지 원문 복사 금지 원칙에 따라 "힌트 토큰 + (공식 공지 참조)" placeholder만 자동 삽입하고, 사용자가 손으로 다듬는다.
- 2026-10-10 · 플래그 쿠폰 `구글1위잔치로구나` 공식 포럼에서 확인됨 (`forum.kakaogames.com/dokkaebi/postView/?code=notice&id=10503`, "구글 플레이 스토어 인기 1위 기념 특별 쿠폰 안내", 2026-10-08 발행). 다음 CI 실행 시 자동 수집된다. 로컬 dry-run 결과 그 외에도 `도깨비의다짐 / 도깨비의약속 / 도깨비의마음` 3건(id=12167 "10/9 라이브 방송 종합 안내 및 감사 쿠폰 안내")도 함께 추출됨 — 모두 공식 공지 교차검증 완료.
- 2026-10-10 · 자동 수집 커밋과 수동 추가 커밋을 구분하기 위해 CI 커밋 메시지 prefix를 `feat(scrape):`로 고정. main↔develop diff에서 이 prefix 커밋만 세어 10건 이상이면 `release-reminder` Issue 생성. 릴리스는 사용자가 메인 세션에서 `/cnp --release`로 수동 실행 (CI는 release 안 함).
