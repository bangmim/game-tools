# game-tools 작업 플랜

> 이 파일은 Claude Code가 작업 전 반드시 끝까지 읽습니다.
> 작성일: 2026-10-09 · 유효 범위: 다음 1~2 세션

## 목표
도깨비 운영 밀도(쿠폰·초반 가이드)를 올리고, 11월 신작(템빨) 사전 선점을 위해 스켈레톤을 미리 올려둔다.

## 범위
- [~] 도깨비 신규 쿠폰 리서치 → `data/games/dokkaebi.ts` 반영 — **보류**. Agent R이 공식 공지 검증 실패로 추가하지 않음 (forum.kakaogames.com SPA · WebFetch 한계). 플래그 쿠폰은 미확정 사항으로 승격.
- [x] 도깨비 초반 체크리스트 페이지 추가 (`/dokkaebi/beginner/`) — Agent C `b58856f` + Chair round 2 `ae1cbdf` (언론·프리뷰 소스 삭제, 공식 교차검증 가능 항목만 유지). worktree: `.claude/worktrees/agent-aa242043ee51165de`, 브랜치: `feat/dokkaebi-beginner` — 사용자 /cnp --merge 대기.
- [x] 템빨: 오버기어드 스켈레톤 추가 — Agent S `ee8f2ac` + Chair round 2 `2dc23fe` (`releasedAt: "2026-11 (예정)"`). worktree: `.claude/worktrees/agent-a3df34ddc14cc33a5`, 브랜치: `feat/add-tempal` — 사용자 /cnp --merge 대기.

## 미확정 사항
- [ ] `develop → main` 머지 주기·트리거 기준 구체화 (요일 고정? 쿠폰 N개 쌓이면? docs-only는 묶음 대기?)
- [ ] AdSense 신청 기준 수치화 (일 유입 N명/일, 추가 페이지 M개 이후 등)
- [ ] Netlify Analytics vs GA / PostHog 도입 시점·수단 선정 (AdSense 신청 전 유입 측정 필요)
- [ ] 플래그 쿠폰 `구글1위잔치로구나` 공식 포럼 확인 필요 — Agent R이 kupon.kr·gametrends 등 3rd-party 집계처에서만 발견. 사용자가 forum.kakaogames.com/dokkaebi 를 브라우저로 열어 공식 공지에서 교차검증 후 다음 세션에 반영 여부 결정.
- [ ] SPA 공식 공지 수집용 Playwright/MCP 브라우저 도구 도입 검토 — Agent X 제안. forum.kakaogames.com이 SPA라 WebFetch로 공지 본문을 못 가져옴. 반복 리서치 수요가 커지면 일회성 도입 비용 지불 가치 있음.

## 결정 기록
- 2026-10-09 · 브랜치 모델을 `main` 직접 push → `feat/* → develop → main` 로 전환. Netlify 배포 트리거는 `main` 유지. (HANDOFF.md §7.8, 커밋 `d37b0d3`, 머지 `ce7361a`)
- 2026-10-09 · GitHub default branch는 이미 `develop`으로 설정되어 있는 것 확인 (`gh api` 조회).
- 2026-10-09 · 이번 PLAN 범위에 "도메인 구매"는 포함 안 함 — 현재는 netlify.app 서브도메인 유지.
- 2026-10-09 · 기존 도깨비 쿠폰 3건의 `expiresAt: null` 품질 — 뉴스 소스가 특정 만료일(11-11, 11-07 등)을 암시하지만 공식 공지로 교차검증 안 됨. **공식 교차검증 전까지 null 유지** (뉴스 추정값으로 수정 X). 사이트에서는 "기간 제한 없음"으로 표시되지만, 틀린 날짜 넣는 것보다 보수적으로 안전. HANDOFF §7.3 (translator-feed 교훈) 적용.
- 2026-10-09 · 병렬 작업 세션 결과 (R·C·S·X·Chair): R은 공식 미검증으로 no-commit (브랜치 폐기), C는 Critic 지적 반영해 축소판 재작성 후 머지 대기, S는 미세 수정 후 머지 대기. 회의록·근거는 세션 로그에 보존.
